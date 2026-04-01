import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { AuthContext } from '@/contexts/AuthContext';
import {
  AccountState,
  type CharacterAttributes,
  type CharacterDetails,
} from '@/api/types';
import {
  useBroadcastMessage,
  useChangeAccountState,
  useChangeGuildMaster,
  useDisbandGuild,
  useForceResetCharacter,
  useGetAdminAccounts,
  useGetAdminCharacter,
  useGetAdminGuild,
  useKickCharacter,
  useTeleportCharacter,
  useTemporarilyBanCharacter,
  useUpdateCharacterAttributesAsAdmin,
  type AdminAccount,
} from '@/api/admin';
import {
  useGetGameServers,
  useGetOnlinePlayers,
  useGetServerStatistics,
} from '@/api/game-server';
import {
  useGetBetaSocialLinks,
  useCreateManagedAccount,
  useDisconnectLoggedInAccount,
  useGetManagedAccount,
  useGetLoggedInAccounts,
  useGetLogFiles,
  useGetManageableServers,
  useRemoveManageableServer,
  useRestartAllManageableServers,
  useStartManageableServer,
  useStopManageableServer,
  useUpdateManagedAccount,
  useUpdateBetaSocialLinks,
  type BetaSocialLinksUpdateInput,
  type LoggedInAccount,
  type ManageableServer,
  type ManagedAccountCreateInput,
  type ManagedAccountUpdateInput,
} from '@/api/super-admin';
import useBaseTranslation from '@/hooks/use-base-translation';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/i18n/get-api-error-message';
import {
  canAccessGameMasterPanel,
  canAccessSuperAdminPanel,
  getAccountRole,
} from '@/auth/authorization';

import Table from '@/components/Table/Table';
import Typography from '@/components/Typography/Typography';
import Pagination from '@/components/Pagination/Pagination';
import Button from '@/components/Button/Button';
import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import LoadingTableBody from '@/components/Table/LoadingTableBody';
import TableEmptyMessage from '@/components/Table/TableEmptyMessage/TableEmptyMessage';
import Tabs from '@/components/Tabs/Tabs';
import ManagedAccountForm, {
  type ManagedAccountFormValues,
} from './ManagedAccountForm';
import BetaSocialLinksForm, {
  type BetaSocialLinksFormValues,
} from './BetaSocialLinksForm';

const PAGE_SIZE = 10;
const ONLINE_PLAYERS_REFRESH_INTERVAL = 30_000;
const LEGACY_PANEL_URL = import.meta.env.VITE_BASTION_PANEL_URL as
  | string
  | undefined;

const EMPTY_MANAGED_ACCOUNT_FORM: ManagedAccountFormValues = {
  loginName: '',
  email: '',
  securityCode: '',
  state: AccountState.NORMAL,
  password: '',
  nextPassword: '',
  vaultPassword: '',
  vaultExtended: false,
};

const EMPTY_ATTRIBUTE_FORM: CharacterAttributes = {
  strength: 0,
  agility: 0,
  vitality: 0,
  energy: 0,
  command: 0,
};

const EMPTY_BETA_SOCIAL_LINKS_FORM: BetaSocialLinksFormValues = {
  enabled: false,
  instagramUrl: '',
  discordUrl: '',
  facebookUrl: '',
  youtubeUrl: '',
};

const STATE_COLORS: Record<AccountState, string> = {
  [AccountState.NORMAL]: 'text-green-500',
  [AccountState.GAME_MASTER]: 'text-blue-500',
  [AccountState.GAME_MASTER_INVISIBLE]: 'text-blue-400',
  [AccountState.SUPER_ADMIN]: 'text-fuchsia-500',
  [AccountState.SPECTATOR]: 'text-neutral-400',
  [AccountState.BANNED]: 'text-red-500',
  [AccountState.TEMPORARILY_BANNED]: 'text-orange-500',
};

enum AdminTab {
  SESSIONS,
  SERVERS,
  LOGS,
  SOCIALS,
  ACCOUNTS,
  ONLINE,
  CHARACTERS,
  GUILDS,
  TOOLS,
}

const getFormattedApiError = (error: Error) => {
  const responseData = (error as AxiosError).response?.data;
  const errorMessage =
    responseData && typeof responseData === 'object'
      ? Object.values(responseData as Record<string, string>).join(' ')
      : String(responseData ?? error.message);

  return getApiErrorMessage(errorMessage);
};

type AdminProps = {
  scope?: 'gm' | 'superadmin';
};

const Admin: React.FC<AdminProps> = ({ scope = 'gm' }) => {
  const { auth } = useContext(AuthContext);
  const { t } = useBaseTranslation('admin');
  const { openToast } = useToast();
  const role = getAccountRole(auth.token);
  const isAdmin = canAccessGameMasterPanel(role);
  const isSuperAdmin = canAccessSuperAdminPanel(role);
  const canManageAccounts = isSuperAdmin;

  const [activeTab, setActiveTab] = useState(
    scope === 'superadmin' ? AdminTab.SESSIONS : AdminTab.ONLINE,
  );
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingStates, setPendingStates] = useState<
    Record<string, AccountState>
  >({});
  const [managedAccountMode, setManagedAccountMode] = useState<
    'create' | 'edit' | null
  >(null);
  const [selectedManagedAccountLogin, setSelectedManagedAccountLogin] =
    useState<string | null>(null);
  const [managedAccountForm, setManagedAccountForm] =
    useState<ManagedAccountFormValues>(EMPTY_MANAGED_ACCOUNT_FORM);
  const [pendingServerAction, setPendingServerAction] = useState<string | null>(
    null,
  );
  const [onlineSearch, setOnlineSearch] = useState('');
  const [pendingCharacterAction, setPendingCharacterAction] = useState<
    string | null
  >(null);
  const [sessionsSearch, setSessionsSearch] = useState('');
  const [pendingSessionDisconnect, setPendingSessionDisconnect] = useState<
    string | null
  >(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedServerId, setSelectedServerId] = useState('');
  const [characterLookupInput, setCharacterLookupInput] = useState('');
  const [selectedCharacterName, setSelectedCharacterName] = useState('');
  const [teleportMapName, setTeleportMapName] = useState('');
  const [teleportX, setTeleportX] = useState('0');
  const [teleportY, setTeleportY] = useState('0');
  const [attributeForm, setAttributeForm] =
    useState<CharacterAttributes>(EMPTY_ATTRIBUTE_FORM);
  const [guildLookupInput, setGuildLookupInput] = useState('');
  const [selectedGuildName, setSelectedGuildName] = useState('');
  const [newGuildMasterName, setNewGuildMasterName] = useState('');
  const [betaSocialLinksForm, setBetaSocialLinksForm] =
    useState<BetaSocialLinksFormValues>(EMPTY_BETA_SOCIAL_LINKS_FORM);

  const { data: serverStatistics } = useGetServerStatistics();
  const { data: accountsPage, isLoading: isAccountsLoading } =
    useGetAdminAccounts(
      currentPage - 1,
      PAGE_SIZE,
      search || undefined,
      isAdmin,
    );
  const {
    data: onlinePlayers = [],
    isLoading: isOnlinePlayersLoading,
    isFetching: isOnlinePlayersFetching,
    refetch: refetchOnlinePlayers,
  } = useGetOnlinePlayers(
    isAdmin && activeTab === AdminTab.ONLINE,
    ONLINE_PLAYERS_REFRESH_INTERVAL,
  );
  const { data: gameServers = [], isLoading: isGameServersLoading } =
    useGetGameServers(isAdmin && activeTab === AdminTab.TOOLS);
  const {
    data: adminCharacter,
    isLoading: isAdminCharacterLoading,
    error: adminCharacterError,
  } = useGetAdminCharacter(
    selectedCharacterName,
    isAdmin && activeTab === AdminTab.CHARACTERS,
  );
  const {
    data: adminGuild,
    isLoading: isAdminGuildLoading,
    error: adminGuildError,
  } = useGetAdminGuild(
    selectedGuildName,
    isAdmin && activeTab === AdminTab.GUILDS,
  );
  const {
    data: loggedInAccounts = [],
    isLoading: isLoggedInAccountsLoading,
    isError: isLoggedInAccountsError,
  } = useGetLoggedInAccounts(isSuperAdmin && activeTab === AdminTab.SESSIONS);
  const {
    data: manageableServers = [],
    isLoading: isManageableServersLoading,
    isError: isManageableServersError,
  } = useGetManageableServers(isSuperAdmin && activeTab === AdminTab.SERVERS);
  const {
    data: logFiles = [],
    isLoading: isLogFilesLoading,
    isError: isLogFilesError,
  } = useGetLogFiles(isSuperAdmin && activeTab === AdminTab.LOGS);
  const { data: betaSocialLinks, isLoading: isBetaSocialLinksLoading } =
    useGetBetaSocialLinks(isSuperAdmin && activeTab === AdminTab.SOCIALS);
  const { data: managedAccountDetails, isLoading: isManagedAccountLoading } =
    useGetManagedAccount(
      selectedManagedAccountLogin ?? undefined,
      isSuperAdmin && managedAccountMode === 'edit',
    );

  const { mutate: updateState, isPending: isStateChangePending } =
    useChangeAccountState();
  const { mutate: createManagedAccount, isPending: isCreatingManagedAccount } =
    useCreateManagedAccount();
  const { mutate: updateManagedAccount, isPending: isUpdatingManagedAccount } =
    useUpdateManagedAccount();
  const { mutate: kickCharacter } = useKickCharacter();
  const { mutate: temporarilyBanCharacter } = useTemporarilyBanCharacter();
  const { mutate: teleportCharacter, isPending: isTeleportPending } =
    useTeleportCharacter();
  const { mutate: forceResetCharacter, isPending: isForceResetPending } =
    useForceResetCharacter();
  const {
    mutate: updateCharacterAttributesAsAdmin,
    isPending: isAttributeUpdatePending,
  } = useUpdateCharacterAttributesAsAdmin();
  const { mutate: changeGuildMaster, isPending: isGuildMasterChangePending } =
    useChangeGuildMaster();
  const { mutate: disbandGuild, isPending: isDisbandGuildPending } =
    useDisbandGuild();
  const { mutate: disconnectLoggedInAccount } = useDisconnectLoggedInAccount();
  const {
    mutate: updateBetaSocialLinks,
    isPending: isUpdatingBetaSocialLinks,
  } = useUpdateBetaSocialLinks();
  const { mutate: startManageableServer } = useStartManageableServer();
  const { mutate: stopManageableServer } = useStopManageableServer();
  const { mutate: removeManageableServer } = useRemoveManageableServer();
  const {
    mutate: restartAllManageableServers,
    isPending: isRestartingAllServers,
  } = useRestartAllManageableServers();
  const { mutate: sendBroadcastMessage, isPending: isBroadcastPending } =
    useBroadcastMessage();

  useEffect(() => {
    if (!selectedServerId && gameServers.length > 0) {
      setSelectedServerId(String(gameServers[0].serverId));
    }
  }, [gameServers, selectedServerId]);

  useEffect(() => {
    if (!adminCharacter) {
      return;
    }

    setTeleportMapName(adminCharacter.currentMap?.mapName ?? '');
    setTeleportX(String(adminCharacter.currentMap?.positionX ?? 0));
    setTeleportY(String(adminCharacter.currentMap?.positionY ?? 0));
    setAttributeForm(EMPTY_ATTRIBUTE_FORM);
  }, [adminCharacter]);

  useEffect(() => {
    if (!adminGuild) {
      return;
    }

    setNewGuildMasterName(adminGuild.guildMaster ?? '');
  }, [adminGuild]);

  useEffect(() => {
    if (!adminCharacterError) {
      return;
    }

    openToast.error(getFormattedApiError(adminCharacterError));
  }, [adminCharacterError, openToast]);

  useEffect(() => {
    if (!adminGuildError) {
      return;
    }

    openToast.error(getFormattedApiError(adminGuildError));
  }, [adminGuildError, openToast]);

  useEffect(() => {
    if (!managedAccountDetails || managedAccountMode !== 'edit') {
      return;
    }

    setManagedAccountForm({
      loginName: managedAccountDetails.loginName,
      email: managedAccountDetails.email,
      securityCode: '',
      state: managedAccountDetails.state,
      password: '',
      nextPassword: '',
      vaultPassword: managedAccountDetails.vaultPassword ?? '',
      vaultExtended: managedAccountDetails.vaultExtended,
    });
  }, [managedAccountDetails, managedAccountMode]);

  useEffect(() => {
    if (!betaSocialLinks) {
      return;
    }

    setBetaSocialLinksForm({
      enabled: betaSocialLinks.enabled,
      instagramUrl: betaSocialLinks.instagramUrl ?? '',
      discordUrl: betaSocialLinks.discordUrl ?? '',
      facebookUrl: betaSocialLinks.facebookUrl ?? '',
      youtubeUrl: betaSocialLinks.youtubeUrl ?? '',
    });
  }, [betaSocialLinks]);

  useEffect(() => {
    if (
      !canManageAccounts &&
      (activeTab === AdminTab.ACCOUNTS ||
        activeTab === AdminTab.SESSIONS ||
        activeTab === AdminTab.SERVERS ||
        activeTab === AdminTab.LOGS ||
        activeTab === AdminTab.SOCIALS)
    ) {
      setActiveTab(AdminTab.ONLINE);
    }
  }, [activeTab, canManageAccounts]);

  if (!isAdmin) return <Navigate to="/" />;
  if (scope === 'superadmin' && !isSuperAdmin) return <Navigate to="/gm" />;
  if (scope === 'gm' && isSuperAdmin) return <Navigate to="/superadmin" />;

  const filteredOnlinePlayers = onlinePlayers.filter((character) => {
    const query = onlineSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [character.characterName, character.characterClassName]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const filteredLoggedInAccounts = loggedInAccounts.filter((account) => {
    const query = sessionsSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [account.loginName, String(account.serverId)]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    setPendingStates({});
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    setPendingStates({});
  };

  const handleSelectChange = (loginName: string, state: AccountState) => {
    setPendingStates((prev) => ({ ...prev, [loginName]: state }));
  };

  const handleManagedAccountFieldChange = (
    field: keyof ManagedAccountFormValues,
    value: string | boolean | AccountState,
  ) => {
    setManagedAccountForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBetaSocialLinksFieldChange = (
    field: keyof BetaSocialLinksFormValues,
    value: string | boolean,
  ) => {
    setBetaSocialLinksForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateManagedAccount = () => {
    setManagedAccountMode('create');
    setSelectedManagedAccountLogin(null);
    setManagedAccountForm(EMPTY_MANAGED_ACCOUNT_FORM);
  };

  const handleEditManagedAccount = (loginName: string) => {
    setManagedAccountMode('edit');
    setSelectedManagedAccountLogin(loginName);
  };

  const handleCloseManagedAccountForm = () => {
    setManagedAccountMode(null);
    setSelectedManagedAccountLogin(null);
    setManagedAccountForm(EMPTY_MANAGED_ACCOUNT_FORM);
  };

  const handleSave = (account: AdminAccount) => {
    const newState = pendingStates[account.loginName];
    if (!newState) return;

    updateState(
      { loginName: account.loginName, state: newState },
      {
        onSuccess: () => {
          setPendingStates((prev) => {
            const next = { ...prev };
            delete next[account.loginName];
            return next;
          });
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
      },
    );
  };

  const handleManagedAccountSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (managedAccountMode === 'create') {
      const payload: ManagedAccountCreateInput = {
        loginName: managedAccountForm.loginName.trim(),
        email: managedAccountForm.email.trim(),
        password: managedAccountForm.password,
        securityCode: managedAccountForm.securityCode.trim(),
        state: managedAccountForm.state,
      };

      createManagedAccount(payload, {
        onSuccess: () => {
          openToast.success(t('managedAccountCreateSuccess'));
          handleCloseManagedAccountForm();
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
      });
      return;
    }

    if (managedAccountMode === 'edit' && selectedManagedAccountLogin) {
      const payload: ManagedAccountUpdateInput = {
        email: managedAccountForm.email.trim(),
        securityCode: managedAccountForm.securityCode.trim(),
        state: managedAccountForm.state,
        vaultPassword: managedAccountForm.vaultPassword,
        vaultExtended: managedAccountForm.vaultExtended,
        nextPassword: managedAccountForm.nextPassword,
      };

      updateManagedAccount(
        {
          loginName: selectedManagedAccountLogin,
          payload,
        },
        {
          onSuccess: () => {
            openToast.success(
              t('managedAccountUpdateSuccess', {
                loginName: selectedManagedAccountLogin,
              }),
            );
            handleCloseManagedAccountForm();
          },
          onError: (error: Error) => {
            openToast.error(getFormattedApiError(error));
          },
        },
      );
    }
  };

  const handleKick = (characterName: string) => {
    setPendingCharacterAction(`kick:${characterName}`);

    kickCharacter(characterName, {
      onSuccess: () => {
        openToast.success(t('kickSuccess'));
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
      onSettled: () => {
        setPendingCharacterAction(null);
      },
    });
  };

  const handleTemporaryBan = (characterName: string) => {
    setPendingCharacterAction(`temporary-ban:${characterName}`);

    temporarilyBanCharacter(characterName, {
      onSuccess: () => {
        openToast.success(t('temporaryBanSuccess'));
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
      onSettled: () => {
        setPendingCharacterAction(null);
      },
    });
  };

  const handleDisconnectLoggedInAccount = (account: LoggedInAccount) => {
    setPendingSessionDisconnect(account.loginName);

    disconnectLoggedInAccount(account, {
      onSuccess: () => {
        openToast.success(
          t('loggedInDisconnectSuccess', { loginName: account.loginName }),
        );
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
      onSettled: () => {
        setPendingSessionDisconnect(null);
      },
    });
  };

  const handleStartServer = (server: ManageableServer) => {
    setPendingServerAction(`start:${server.id}`);
    startManageableServer(server.id, {
      onSuccess: () => {
        openToast.success(
          t('manageableServerStartSuccess', { name: server.description }),
        );
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
      onSettled: () => setPendingServerAction(null),
    });
  };

  const handleStopServer = (server: ManageableServer) => {
    setPendingServerAction(`stop:${server.id}`);
    stopManageableServer(server.id, {
      onSuccess: () => {
        openToast.success(
          t('manageableServerStopSuccess', { name: server.description }),
        );
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
      onSettled: () => setPendingServerAction(null),
    });
  };

  const handleRemoveServer = (server: ManageableServer) => {
    setPendingServerAction(`remove:${server.id}`);
    removeManageableServer(
      { serverId: server.id, type: server.type },
      {
        onSuccess: () => {
          openToast.success(
            t('manageableServerRemoveSuccess', { name: server.description }),
          );
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
        onSettled: () => setPendingServerAction(null),
      },
    );
  };

  const handleRestartAllServers = () => {
    restartAllManageableServers(undefined, {
      onSuccess: () => {
        openToast.success(t('manageableServerRestartAllSuccess'));
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
    });
  };

  const handleBetaSocialLinksSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: BetaSocialLinksUpdateInput = {
      enabled: betaSocialLinksForm.enabled,
      instagramUrl: betaSocialLinksForm.instagramUrl.trim(),
      discordUrl: betaSocialLinksForm.discordUrl.trim(),
      facebookUrl: betaSocialLinksForm.facebookUrl.trim(),
      youtubeUrl: betaSocialLinksForm.youtubeUrl.trim(),
    };

    updateBetaSocialLinks(payload, {
      onSuccess: () => {
        openToast.success(t('socialLinksSaveSuccess'));
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
    });
  };

  const handleBroadcastSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedMessage = broadcastMessage.trim();
    if (!trimmedMessage || !selectedServerId) {
      openToast.warning(t('broadcastValidation'));
      return;
    }

    sendBroadcastMessage(
      {
        serverId: Number(selectedServerId),
        message: trimmedMessage,
      },
      {
        onSuccess: () => {
          setBroadcastMessage('');
          openToast.success(t('broadcastSuccess'));
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
      },
    );
  };

  const handleCharacterLookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCharacterName = characterLookupInput.trim();
    if (!nextCharacterName) {
      openToast.warning(t('characterLookupValidation'));
      return;
    }

    setSelectedCharacterName(nextCharacterName);
  };

  const handleTeleportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const mapName = teleportMapName.trim();
    const x = Number(teleportX);
    const y = Number(teleportY);

    if (
      !selectedCharacterName ||
      !mapName ||
      Number.isNaN(x) ||
      Number.isNaN(y)
    ) {
      openToast.warning(t('characterTeleportValidation'));
      return;
    }

    teleportCharacter(
      { characterName: selectedCharacterName, mapName, x, y },
      {
        onSuccess: () => {
          openToast.success(
            t('characterTeleportSuccess', {
              characterName: selectedCharacterName,
            }),
          );
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
      },
    );
  };

  const handleForceReset = () => {
    if (!selectedCharacterName) {
      return;
    }

    forceResetCharacter(selectedCharacterName, {
      onSuccess: () => {
        setAttributeForm(EMPTY_ATTRIBUTE_FORM);
        openToast.success(
          t('characterResetSuccess', { characterName: selectedCharacterName }),
        );
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
    });
  };

  const handleAttributeFormChange = (
    field: keyof CharacterAttributes,
    value: string,
  ) => {
    const parsed = Number.parseInt(value.replaceAll(/[^0-9]/g, ''), 10) || 0;

    setAttributeForm((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  };

  const handleAttributeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCharacterName) {
      return;
    }

    const totalRequestedPoints = Object.values(attributeForm).reduce(
      (sum, value) => sum + value,
      0,
    );

    if (totalRequestedPoints === 0) {
      openToast.warning(t('characterAttributesValidation'));
      return;
    }

    updateCharacterAttributesAsAdmin(
      { characterName: selectedCharacterName, attributes: attributeForm },
      {
        onSuccess: () => {
          setAttributeForm(EMPTY_ATTRIBUTE_FORM);
          openToast.success(
            t('characterAttributesSuccess', {
              characterName: selectedCharacterName,
            }),
          );
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
      },
    );
  };

  const handleGuildLookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextGuildName = guildLookupInput.trim();
    if (!nextGuildName) {
      openToast.warning(t('guildLookupValidation'));
      return;
    }

    setSelectedGuildName(nextGuildName);
  };

  const handleGuildMasterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMaster = newGuildMasterName.trim();
    if (!selectedGuildName || !nextMaster) {
      openToast.warning(t('guildMasterValidation'));
      return;
    }

    changeGuildMaster(
      {
        guildName: selectedGuildName,
        newMasterCharacterName: nextMaster,
      },
      {
        onSuccess: () => {
          openToast.success(
            t('guildMasterSuccess', { guildName: selectedGuildName }),
          );
        },
        onError: (error: Error) => {
          openToast.error(getFormattedApiError(error));
        },
      },
    );
  };

  const handleDisbandGuild = () => {
    if (!selectedGuildName) {
      return;
    }

    disbandGuild(selectedGuildName, {
      onSuccess: () => {
        setSelectedGuildName('');
        setGuildLookupInput('');
        setNewGuildMasterName('');
        openToast.success(
          t('guildDisbandSuccess', { guildName: selectedGuildName }),
        );
      },
      onError: (error: Error) => {
        openToast.error(getFormattedApiError(error));
      },
    });
  };

  const columns = [
    { name: 'loginName', label: t('table.login'), style: 'text-left px-2' },
    { name: 'email', label: t('table.email'), style: 'text-left px-2' },
    { name: 'state', label: t('table.status'), style: 'text-center px-2' },
    {
      name: 'registrationDate',
      label: t('table.registrationDate'),
      style: 'text-center px-2',
    },
    { name: 'actions', label: t('table.actions'), style: 'text-center px-2' },
  ];

  const onlineColumns = [
    {
      name: 'characterName',
      label: t('onlineTable.name'),
      style: 'text-left px-2',
    },
    {
      name: 'characterClassName',
      label: t('onlineTable.class'),
      style: 'text-center px-2',
    },
    { name: 'level', label: t('onlineTable.level'), style: 'text-center px-2' },
    {
      name: 'resets',
      label: t('onlineTable.resets'),
      style: 'text-center px-2',
    },
    {
      name: 'actions',
      label: t('onlineTable.actions'),
      style: 'text-center px-2',
    },
  ];

  const loggedInColumns = [
    {
      name: 'loginName',
      label: t('loggedInTable.loginName'),
      style: 'text-left px-2',
    },
    {
      name: 'serverId',
      label: t('loggedInTable.serverId'),
      style: 'text-center px-2',
    },
    {
      name: 'actions',
      label: t('loggedInTable.actions'),
      style: 'text-center px-2',
    },
  ];

  const manageableServerColumns = [
    {
      name: 'description',
      label: t('manageableServerTable.name'),
      style: 'text-left px-2',
    },
    {
      name: 'type',
      label: t('manageableServerTable.type'),
      style: 'text-center px-2',
    },
    {
      name: 'state',
      label: t('manageableServerTable.state'),
      style: 'text-center px-2',
    },
    {
      name: 'connections',
      label: t('manageableServerTable.connections'),
      style: 'text-center px-2',
    },
    {
      name: 'actions',
      label: t('manageableServerTable.actions'),
      style: 'text-center px-2',
    },
  ];

  const logFileColumns = [
    {
      name: 'name',
      label: t('logFileTable.name'),
      style: 'text-left px-2',
    },
    {
      name: 'lastUpdatedAt',
      label: t('logFileTable.updatedAt'),
      style: 'text-center px-2',
    },
    {
      name: 'sizeLabel',
      label: t('logFileTable.size'),
      style: 'text-center px-2',
    },
    {
      name: 'actions',
      label: t('logFileTable.actions'),
      style: 'text-center px-2',
    },
  ];

  const renderSessionsTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('loggedInTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('loggedInDescription')}
          </Typography>
        </div>
        <input
          className="h-10 w-full rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 md:w-72"
          placeholder={t('loggedInSearchPlaceholder')}
          value={sessionsSearch}
          onChange={(e) => setSessionsSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Typography
          component="span"
          variant="body2-r"
          styles="text-neutral-600 dark:text-neutral-300"
        >
          {t('loggedInCount', { count: filteredLoggedInAccounts.length })}
        </Typography>
        <Typography
          component="span"
          variant="body2-r"
          styles="text-neutral-500 dark:text-neutral-400"
        >
          {t('loggedInRuntimeHint')}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto">
        <Table columns={loggedInColumns}>
          {isLoggedInAccountsLoading ? (
            <LoadingTableBody />
          ) : isLoggedInAccountsError ? (
            <TableEmptyMessage
              message={t('runtimeUnavailableMessage')}
              type="page"
            />
          ) : filteredLoggedInAccounts.length === 0 ? (
            <TableEmptyMessage
              message={t('loggedInEmptyMessage')}
              type="page"
            />
          ) : (
            filteredLoggedInAccounts.map((account, index) => {
              const isLast = index === filteredLoggedInAccounts.length - 1;
              const isPending = pendingSessionDisconnect === account.loginName;

              return (
                <tr
                  key={`${account.loginName}:${account.serverId}`}
                  className={`border-b ${
                    isLast
                      ? 'border-neutral-700 dark:border-neutral-600'
                      : 'border-neutral-300 dark:border-primary-400/30'
                  }`}
                >
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    {account.loginName}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {t('serverLabel', { id: account.serverId })}
                  </Typography>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleDisconnectLoggedInAccount(account)}
                      >
                        {isPending
                          ? t('loggedInDisconnectPending')
                          : t('loggedInDisconnectButton')}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </div>
    </div>
  );

  const renderAccountsTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('accountsTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('accountsDescription')}
          </Typography>
        </div>
        <input
          className="h-10 w-full rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 md:max-w-xs"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)]">
        <div className="flex flex-col gap-2 overflow-x-auto">
          <div className="flex justify-end">
            <Button onClick={handleCreateManagedAccount}>
              {t('managedAccountCreateButton')}
            </Button>
          </div>
          <Table columns={columns}>
            {isAccountsLoading ? (
              <LoadingTableBody />
            ) : accountsPage?.content.length === 0 ? (
              <TableEmptyMessage message={t('emptyMessage')} type="page" />
            ) : (
              accountsPage?.content.map((account, index) => {
                const isLast =
                  index === (accountsPage?.content.length ?? 0) - 1;
                const currentState =
                  pendingStates[account.loginName] ?? account.state;
                const isDirty =
                  pendingStates[account.loginName] !== undefined &&
                  pendingStates[account.loginName] !== account.state;

                return (
                  <tr
                    key={account.loginName}
                    className={`border-b ${
                      isLast
                        ? 'border-neutral-700 dark:border-neutral-600'
                        : 'border-neutral-300 dark:border-primary-400/30'
                    }`}
                  >
                    <Typography
                      component="td"
                      variant="label2-r"
                      styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                    >
                      {account.loginName}
                    </Typography>
                    <Typography
                      component="td"
                      variant="label2-r"
                      styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                    >
                      {account.email}
                    </Typography>
                    <Typography
                      component="td"
                      variant="label2-r"
                      styles={`px-2 py-2 text-center font-semibold ${
                        STATE_COLORS[account.state]
                      }`}
                    >
                      {t(`states.${account.state}`)}
                    </Typography>
                    <Typography
                      component="td"
                      variant="label2-r"
                      styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                    >
                      {new Date(account.registrationDate).toLocaleDateString()}
                    </Typography>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={currentState}
                          onChange={(e) =>
                            handleSelectChange(
                              account.loginName,
                              e.target.value as AccountState,
                            )
                          }
                          className="rounded-[4px] border border-neutral-300 bg-white p-1 font-inter text-[13px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                        >
                          {Object.values(AccountState).map((state) => (
                            <option key={state} value={state}>
                              {t(`states.${state}`)}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          disabled={isStateChangePending || !isDirty}
                          onClick={() => handleSave(account)}
                        >
                          {t('saveState')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleEditManagedAccount(account.loginName)
                          }
                        >
                          {t('managedAccountEditButton')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </Table>
          <Pagination
            styles="self-end"
            onPageChange={handlePageChange}
            currentPage={currentPage}
            totalPages={Math.max(accountsPage?.totalPages ?? 1, currentPage)}
          />
        </div>

        {managedAccountMode ? (
          <ManagedAccountForm
            mode={managedAccountMode}
            isLoading={isManagedAccountLoading}
            isSubmitting={isCreatingManagedAccount || isUpdatingManagedAccount}
            values={managedAccountForm}
            onChange={handleManagedAccountFieldChange}
            onCancel={handleCloseManagedAccountForm}
            onSubmit={handleManagedAccountSubmit}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white/40 p-5 dark:border-neutral-700 dark:bg-neutral-950/20">
            <Typography
              component="h3"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {t('managedAccountPlaceholderTitle')}
            </Typography>
            <Typography
              component="p"
              variant="body2-r"
              styles="mt-2 text-neutral-600 dark:text-neutral-300"
            >
              {t('managedAccountPlaceholderDescription')}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );

  const renderServersTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('manageableServerTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('manageableServerDescription')}
          </Typography>
        </div>
        <Button
          variant="outline"
          disabled={isRestartingAllServers}
          onClick={handleRestartAllServers}
        >
          {isRestartingAllServers
            ? t('manageableServerRestartAllPending')
            : t('manageableServerRestartAllButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto">
        <Table columns={manageableServerColumns}>
          {isManageableServersLoading ? (
            <LoadingTableBody />
          ) : isManageableServersError ? (
            <TableEmptyMessage
              message={t('runtimeUnavailableMessage')}
              type="page"
            />
          ) : manageableServers.length === 0 ? (
            <TableEmptyMessage
              message={t('manageableServerEmptyMessage')}
              type="page"
            />
          ) : (
            manageableServers.map((server, index) => {
              const isLast = index === manageableServers.length - 1;
              const isStarting = pendingServerAction === `start:${server.id}`;
              const isStopping = pendingServerAction === `stop:${server.id}`;
              const isRemoving = pendingServerAction === `remove:${server.id}`;
              const isPending = isStarting || isStopping || isRemoving;
              const canRemove =
                server.type === 'GameServer' || server.type === 'ConnectServer';

              return (
                <tr
                  key={`${server.id}:${server.type}`}
                  className={`border-b ${
                    isLast
                      ? 'border-neutral-700 dark:border-neutral-600'
                      : 'border-neutral-300 dark:border-primary-400/30'
                  }`}
                >
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    {server.description}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {t(`manageableServerTypes.${server.type}`)}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {t(`manageableServerStates.${server.serverState}`)}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {server.currentConnections} /{' '}
                    {server.maximumConnections === 2147483647
                      ? '∞'
                      : server.maximumConnections}
                  </Typography>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleStartServer(server)}
                      >
                        {isStarting
                          ? t('manageableServerStartPending')
                          : t('manageableServerStartButton')}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleStopServer(server)}
                      >
                        {isStopping
                          ? t('manageableServerStopPending')
                          : t('manageableServerStopButton')}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isPending || !canRemove}
                        onClick={() => handleRemoveServer(server)}
                      >
                        {isRemoving
                          ? t('manageableServerRemovePending')
                          : t('manageableServerRemoveButton')}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Typography
          component="h2"
          variant="h3-inter"
          styles="text-neutral-900 dark:text-neutral-100"
        >
          {t('logFileTitle')}
        </Typography>
        <Typography
          component="p"
          variant="body2-r"
          styles="text-neutral-600 dark:text-neutral-300"
        >
          {t('logFileDescription')}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto">
        <Table columns={logFileColumns}>
          {isLogFilesLoading ? (
            <LoadingTableBody />
          ) : isLogFilesError ? (
            <TableEmptyMessage
              message={t('runtimeUnavailableMessage')}
              type="page"
            />
          ) : logFiles.length === 0 ? (
            <TableEmptyMessage message={t('logFileEmptyMessage')} type="page" />
          ) : (
            logFiles.map((logFile, index) => {
              const isLast = index === logFiles.length - 1;

              return (
                <tr
                  key={logFile.name}
                  className={`border-b ${
                    isLast
                      ? 'border-neutral-700 dark:border-neutral-600'
                      : 'border-neutral-300 dark:border-primary-400/30'
                  }`}
                >
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    {logFile.name}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {new Date(logFile.lastUpdatedAt).toLocaleString()}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {logFile.sizeLabel}
                  </Typography>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        disabled={!LEGACY_PANEL_URL}
                        onClick={() => {
                          if (!LEGACY_PANEL_URL) {
                            return;
                          }

                          const targetUrl = new URL(
                            logFile.downloadPath,
                            LEGACY_PANEL_URL,
                          );
                          window.location.assign(targetUrl.toString());
                        }}
                      >
                        {t('logFileOpenButton')}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </div>
    </div>
  );

  const renderSocialLinksTab = () => (
    <BetaSocialLinksForm
      values={betaSocialLinksForm}
      isLoading={isBetaSocialLinksLoading}
      isSubmitting={isUpdatingBetaSocialLinks}
      onChange={handleBetaSocialLinksFieldChange}
      onSubmit={handleBetaSocialLinksSubmit}
    />
  );

  const renderOnlineTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('onlineTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('onlineDescription')}
          </Typography>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            className="h-10 w-full rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 md:w-72"
            placeholder={t('onlineSearchPlaceholder')}
            value={onlineSearch}
            onChange={(e) => setOnlineSearch(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => void refetchOnlinePlayers()}
            disabled={isOnlinePlayersFetching}
          >
            {t('refreshOnline')}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Typography
          component="span"
          variant="body2-r"
          styles="text-neutral-600 dark:text-neutral-300"
        >
          {t('onlineCount', { count: filteredOnlinePlayers.length })}
        </Typography>
        <Typography
          component="span"
          variant="body2-r"
          styles="text-neutral-500 dark:text-neutral-400"
        >
          {isOnlinePlayersFetching && !isOnlinePlayersLoading
            ? t('refreshing')
            : t('autoRefreshHint')}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto">
        <Table columns={onlineColumns}>
          {isOnlinePlayersLoading ? (
            <LoadingTableBody />
          ) : filteredOnlinePlayers.length === 0 ? (
            <TableEmptyMessage message={t('onlineEmptyMessage')} type="page" />
          ) : (
            filteredOnlinePlayers.map((character, index) => {
              const isLast = index === filteredOnlinePlayers.length - 1;
              const isPendingKick =
                pendingCharacterAction === `kick:${character.characterName}`;
              const isPendingTemporaryBan =
                pendingCharacterAction ===
                `temporary-ban:${character.characterName}`;
              const isActionPending = isPendingKick || isPendingTemporaryBan;

              return (
                <tr
                  key={character.characterId}
                  className={`border-b ${
                    isLast
                      ? 'border-neutral-700 dark:border-neutral-600'
                      : 'border-neutral-300 dark:border-primary-400/30'
                  }`}
                >
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    {character.characterName}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {character.characterClassName}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {character.level}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                  >
                    {character.resets}
                  </Typography>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        disabled={isActionPending}
                        onClick={() => handleKick(character.characterName)}
                      >
                        {isPendingKick ? t('kickPending') : t('kickButton')}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isActionPending}
                        onClick={() =>
                          handleTemporaryBan(character.characterName)
                        }
                      >
                        {isPendingTemporaryBan
                          ? t('temporaryBanPending')
                          : t('temporaryBanButton')}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
      <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('broadcastTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('broadcastDescription')}
          </Typography>
        </div>

        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={handleBroadcastSubmit}
        >
          <label className="flex flex-col gap-2">
            <Typography
              component="span"
              variant="label2-r"
              styles="text-neutral-800 dark:text-neutral-200"
            >
              {t('broadcastServerLabel')}
            </Typography>
            <select
              className="rounded-[4px] border border-neutral-300 bg-white p-2 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              disabled={isGameServersLoading || gameServers.length === 0}
            >
              {gameServers.length === 0 ? (
                <option value="">{t('broadcastServerEmpty')}</option>
              ) : null}
              {gameServers.map((server) => (
                <option key={server.serverId} value={server.serverId}>
                  {server.description} (
                  {t('serverLabel', { id: server.serverId })})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <Typography
              component="span"
              variant="label2-r"
              styles="text-neutral-800 dark:text-neutral-200"
            >
              {t('broadcastMessageLabel')}
            </Typography>
            <textarea
              className="min-h-32 rounded-[4px] border border-neutral-300 bg-white p-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
              placeholder={t('broadcastMessagePlaceholder')}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={isBroadcastPending}>
              {isBroadcastPending
                ? t('broadcastSending')
                : t('broadcastSendButton')}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('legacyPanelTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('legacyPanelDescription')}
          </Typography>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-primary-500/30 bg-primary-500/[0.04] p-4 dark:border-primary-400/20 dark:bg-primary-400/[0.06]">
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-700 dark:text-neutral-200"
          >
            {LEGACY_PANEL_URL
              ? t('legacyPanelConfigured', { url: LEGACY_PANEL_URL })
              : t('legacyPanelUnavailable')}
          </Typography>
          <div className="mt-4 flex justify-start">
            <Button
              disabled={!LEGACY_PANEL_URL}
              onClick={() => {
                if (LEGACY_PANEL_URL) {
                  window.location.assign(LEGACY_PANEL_URL);
                }
              }}
            >
              {t('legacyPanelButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCharacterSummary = (character: CharacterDetails) => {
    const isDarkLordClass = ['Dark Lord', 'Lord Emperor'].includes(
      character.characterClassName,
    );

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {character.characterName}
          </Typography>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-500 dark:text-neutral-400"
              >
                {t('characterSummary.class')}
              </Typography>
              <Typography
                component="p"
                variant="body2-r"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {character.characterClassName}
              </Typography>
            </div>
            <div>
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-500 dark:text-neutral-400"
              >
                {t('characterSummary.level')}
              </Typography>
              <Typography
                component="p"
                variant="body2-r"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {character.level} / ML {character.masterLevel}
              </Typography>
            </div>
            <div>
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-500 dark:text-neutral-400"
              >
                {t('characterSummary.resets')}
              </Typography>
              <Typography
                component="p"
                variant="body2-r"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {character.resets}
              </Typography>
            </div>
            <div>
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-500 dark:text-neutral-400"
              >
                {t('characterSummary.location')}
              </Typography>
              <Typography
                component="p"
                variant="body2-r"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {character.currentMap?.mapName} (
                {character.currentMap?.positionX},{' '}
                {character.currentMap?.positionY})
              </Typography>
            </div>
            <div>
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-500 dark:text-neutral-400"
              >
                {t('characterSummary.heroState')}
              </Typography>
              <Typography
                component="p"
                variant="body2-r"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {character.state}
              </Typography>
            </div>
            <div>
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-500 dark:text-neutral-400"
              >
                {t('characterSummary.guild')}
              </Typography>
              <Typography
                component="p"
                variant="body2-r"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {character.guild?.name ?? t('characterSummary.noGuild')}
              </Typography>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={isForceResetPending}
              onClick={handleForceReset}
            >
              {isForceResetPending
                ? t('characterResetPending')
                : t('characterResetButton')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
            <Typography
              component="h3"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {t('characterTeleportTitle')}
            </Typography>
            <Typography
              component="p"
              variant="body2-r"
              styles="mt-2 text-neutral-600 dark:text-neutral-300"
            >
              {t('characterTeleportDescription')}
            </Typography>
            <form
              className="mt-5 grid gap-4 md:grid-cols-3"
              onSubmit={handleTeleportSubmit}
            >
              <input
                className="rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                placeholder={t('characterTeleportMapPlaceholder')}
                value={teleportMapName}
                onChange={(e) => setTeleportMapName(e.target.value)}
              />
              <input
                className="rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                placeholder="X"
                value={teleportX}
                onChange={(e) => setTeleportX(e.target.value)}
              />
              <input
                className="rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                placeholder="Y"
                value={teleportY}
                onChange={(e) => setTeleportY(e.target.value)}
              />
              <div className="flex justify-end md:col-span-3">
                <Button type="submit" disabled={isTeleportPending}>
                  {isTeleportPending
                    ? t('characterTeleportPending')
                    : t('characterTeleportButton')}
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
            <Typography
              component="h3"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {t('characterAttributesTitle')}
            </Typography>
            <Typography
              component="p"
              variant="body2-r"
              styles="mt-2 text-neutral-600 dark:text-neutral-300"
            >
              {t('characterAttributesDescription', {
                points: character.levelUpPoints,
              })}
            </Typography>
            <form
              className="mt-5 grid gap-4 md:grid-cols-2"
              onSubmit={handleAttributeSubmit}
            >
              {(['strength', 'agility', 'vitality', 'energy'] as const).map(
                (field) => (
                  <label key={field} className="flex flex-col gap-2">
                    <Typography
                      component="span"
                      variant="label2-r"
                      styles="text-neutral-800 dark:text-neutral-200"
                    >
                      {t(`characterAttributeFields.${field}`)}
                    </Typography>
                    <input
                      className="rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                      value={attributeForm[field]}
                      onChange={(e) =>
                        handleAttributeFormChange(field, e.target.value)
                      }
                    />
                  </label>
                ),
              )}
              {isDarkLordClass ? (
                <label className="flex flex-col gap-2">
                  <Typography
                    component="span"
                    variant="label2-r"
                    styles="text-neutral-800 dark:text-neutral-200"
                  >
                    {t('characterAttributeFields.command')}
                  </Typography>
                  <input
                    className="rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                    value={attributeForm.command}
                    onChange={(e) =>
                      handleAttributeFormChange('command', e.target.value)
                    }
                  />
                </label>
              ) : null}
              <div className="flex justify-end md:col-span-2">
                <Button type="submit" disabled={isAttributeUpdatePending}>
                  {isAttributeUpdatePending
                    ? t('characterAttributesPending')
                    : t('characterAttributesButton')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderCharacterTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('characterLookupTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('characterLookupDescription')}
          </Typography>
        </div>
        <form
          className="flex w-full gap-2 md:max-w-xl"
          onSubmit={handleCharacterLookup}
        >
          <input
            className="h-10 flex-1 rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
            placeholder={t('characterLookupPlaceholder')}
            value={characterLookupInput}
            onChange={(e) => setCharacterLookupInput(e.target.value)}
          />
          <Button type="submit">{t('characterLookupButton')}</Button>
        </form>
      </div>

      {isAdminCharacterLoading ? (
        <Typography
          component="p"
          variant="body2-r"
          styles="text-neutral-600 dark:text-neutral-300"
        >
          {t('characterLookupLoading')}
        </Typography>
      ) : adminCharacter ? (
        renderCharacterSummary(adminCharacter)
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white/40 p-5 dark:border-neutral-700 dark:bg-neutral-950/20">
          <Typography
            component="h3"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('characterLookupEmptyTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="mt-2 text-neutral-600 dark:text-neutral-300"
          >
            {t('characterLookupEmptyDescription')}
          </Typography>
        </div>
      )}
    </div>
  );

  const renderGuildTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('guildLookupTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="text-neutral-600 dark:text-neutral-300"
          >
            {t('guildLookupDescription')}
          </Typography>
        </div>
        <form
          className="flex w-full gap-2 md:max-w-xl"
          onSubmit={handleGuildLookup}
        >
          <input
            className="h-10 flex-1 rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
            placeholder={t('guildLookupPlaceholder')}
            value={guildLookupInput}
            onChange={(e) => setGuildLookupInput(e.target.value)}
          />
          <Button type="submit">{t('guildLookupButton')}</Button>
        </form>
      </div>

      {isAdminGuildLoading ? (
        <Typography
          component="p"
          variant="body2-r"
          styles="text-neutral-600 dark:text-neutral-300"
        >
          {t('guildLookupLoading')}
        </Typography>
      ) : adminGuild ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
            <Typography
              component="h2"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {adminGuild.name}
            </Typography>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Typography
                  component="span"
                  variant="label2-r"
                  styles="text-neutral-500 dark:text-neutral-400"
                >
                  {t('guildSummary.master')}
                </Typography>
                <Typography
                  component="p"
                  variant="body2-r"
                  styles="text-neutral-900 dark:text-neutral-100"
                >
                  {adminGuild.guildMaster}
                </Typography>
              </div>
              <div>
                <Typography
                  component="span"
                  variant="label2-r"
                  styles="text-neutral-500 dark:text-neutral-400"
                >
                  {t('guildSummary.score')}
                </Typography>
                <Typography
                  component="p"
                  variant="body2-r"
                  styles="text-neutral-900 dark:text-neutral-100"
                >
                  {adminGuild.score}
                </Typography>
              </div>
              <div className="sm:col-span-2">
                <Typography
                  component="span"
                  variant="label2-r"
                  styles="text-neutral-500 dark:text-neutral-400"
                >
                  {t('guildSummary.notice')}
                </Typography>
                <Typography
                  component="p"
                  variant="body2-r"
                  styles="text-neutral-900 dark:text-neutral-100"
                >
                  {adminGuild.notice || t('guildSummary.noNotice')}
                </Typography>
              </div>
            </div>

            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleGuildMasterSubmit}
            >
              <label className="flex flex-col gap-2">
                <Typography
                  component="span"
                  variant="label2-r"
                  styles="text-neutral-800 dark:text-neutral-200"
                >
                  {t('guildMasterLabel')}
                </Typography>
                <input
                  className="rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                  value={newGuildMasterName}
                  onChange={(e) => setNewGuildMasterName(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap justify-between gap-3">
                <Button type="submit" disabled={isGuildMasterChangePending}>
                  {isGuildMasterChangePending
                    ? t('guildMasterPending')
                    : t('guildMasterButton')}
                </Button>
                <Button
                  variant="outline"
                  disabled={isDisbandGuildPending}
                  onClick={handleDisbandGuild}
                >
                  {isDisbandGuildPending
                    ? t('guildDisbandPending')
                    : t('guildDisbandButton')}
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
            <Typography
              component="h3"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {t('guildMembersTitle', { count: adminGuild.members.length })}
            </Typography>
            <div className="mt-5 overflow-x-auto">
              <Table
                columns={[
                  {
                    name: 'characterName',
                    label: t('guildMembersTable.name'),
                    style: 'text-left px-2',
                  },
                  {
                    name: 'characterClassName',
                    label: t('guildMembersTable.class'),
                    style: 'text-center px-2',
                  },
                  {
                    name: 'resets',
                    label: t('guildMembersTable.resets'),
                    style: 'text-center px-2',
                  },
                  {
                    name: 'guildPosition',
                    label: t('guildMembersTable.role'),
                    style: 'text-center px-2',
                  },
                  {
                    name: 'online',
                    label: t('guildMembersTable.online'),
                    style: 'text-center px-2',
                  },
                ]}
              >
                {adminGuild.members.map((member, index) => {
                  const isLast = index === adminGuild.members.length - 1;

                  return (
                    <tr
                      key={member.characterId}
                      className={`border-b ${
                        isLast
                          ? 'border-neutral-700 dark:border-neutral-600'
                          : 'border-neutral-300 dark:border-primary-400/30'
                      }`}
                    >
                      <Typography
                        component="td"
                        variant="label2-r"
                        styles="px-2 py-2 text-neutral-900 dark:text-neutral-100"
                      >
                        {member.characterName}
                      </Typography>
                      <Typography
                        component="td"
                        variant="label2-r"
                        styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                      >
                        {member.characterClassName}
                      </Typography>
                      <Typography
                        component="td"
                        variant="label2-r"
                        styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                      >
                        {member.resets}
                      </Typography>
                      <Typography
                        component="td"
                        variant="label2-r"
                        styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                      >
                        {t(`guildPositions.${member.guildPosition}`)}
                      </Typography>
                      <Typography
                        component="td"
                        variant="label2-r"
                        styles="px-2 py-2 text-center text-neutral-900 dark:text-neutral-100"
                      >
                        {member.online
                          ? t('guildMemberOnline')
                          : t('guildMemberOffline')}
                      </Typography>
                    </tr>
                  );
                })}
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white/40 p-5 dark:border-neutral-700 dark:bg-neutral-950/20">
          <Typography
            component="h3"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('guildLookupEmptyTitle')}
          </Typography>
          <Typography
            component="p"
            variant="body2-r"
            styles="mt-2 text-neutral-600 dark:text-neutral-300"
          >
            {t('guildLookupEmptyDescription')}
          </Typography>
        </div>
      )}
    </div>
  );

  const superAdminLegacySections = [
    { key: 'servers', suffix: '/servers' },
    { key: 'loggedIn', suffix: '/logged-in' },
    { key: 'setup', suffix: '/setup' },
    { key: 'updates', suffix: '/config-updates' },
    { key: 'plugins', suffix: '/plugins' },
    { key: 'logs', suffix: '/logfiles' },
    { key: 'users', suffix: '/users' },
  ];

  const visibleTabs = [
    ...(isSuperAdmin
      ? [{ id: AdminTab.SESSIONS, label: t('tabs.sessions') }]
      : []),
    ...(isSuperAdmin
      ? [{ id: AdminTab.SERVERS, label: t('tabs.servers') }]
      : []),
    ...(isSuperAdmin ? [{ id: AdminTab.LOGS, label: t('tabs.logs') }] : []),
    ...(isSuperAdmin
      ? [{ id: AdminTab.SOCIALS, label: t('tabs.socials') }]
      : []),
    ...(canManageAccounts
      ? [{ id: AdminTab.ACCOUNTS, label: t('tabs.accounts') }]
      : []),
    { id: AdminTab.ONLINE, label: t('tabs.online') },
    { id: AdminTab.CHARACTERS, label: t('tabs.characters') },
    { id: AdminTab.GUILDS, label: t('tabs.guilds') },
    { id: AdminTab.TOOLS, label: t('tabs.tools') },
  ];
  const activeTabIndex = Math.max(
    visibleTabs.findIndex((tab) => tab.id === activeTab),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <TitleWithDivider>
        {isSuperAdmin ? t('superAdminTitle') : t('title')}
      </TitleWithDivider>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800/40 dark:bg-neutral-900/60">
          <Typography
            component="span"
            variant="body2-r"
            styles="text-neutral-500 dark:text-neutral-400"
          >
            {t('stats.accounts')}
          </Typography>
          <Typography
            component="p"
            variant="h3-inter"
            styles="mt-2 text-neutral-900 dark:text-neutral-100"
          >
            {serverStatistics?.accounts ?? '...'}
          </Typography>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800/40 dark:bg-neutral-900/60">
          <Typography
            component="span"
            variant="body2-r"
            styles="text-neutral-500 dark:text-neutral-400"
          >
            {t('stats.characters')}
          </Typography>
          <Typography
            component="p"
            variant="h3-inter"
            styles="mt-2 text-neutral-900 dark:text-neutral-100"
          >
            {serverStatistics?.characters ?? '...'}
          </Typography>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800/40 dark:bg-neutral-900/60">
          <Typography
            component="span"
            variant="body2-r"
            styles="text-neutral-500 dark:text-neutral-400"
          >
            {t('stats.guilds')}
          </Typography>
          <Typography
            component="p"
            variant="h3-inter"
            styles="mt-2 text-neutral-900 dark:text-neutral-100"
          >
            {serverStatistics?.guilds ?? '...'}
          </Typography>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800/40 dark:bg-neutral-900/60">
          <Typography
            component="span"
            variant="body2-r"
            styles="text-neutral-500 dark:text-neutral-400"
          >
            {t('stats.onlines')}
          </Typography>
          <Typography
            component="p"
            variant="h3-inter"
            styles="mt-2 text-neutral-900 dark:text-neutral-100"
          >
            {serverStatistics?.onlines ?? '...'}
          </Typography>
        </div>
      </div>

      {isSuperAdmin ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
          <div className="rounded-lg border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800/40 dark:bg-neutral-950/30">
            <Typography
              component="h2"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {t('superAdminOverviewTitle')}
            </Typography>
            <Typography
              component="p"
              variant="body2-r"
              styles="mt-2 text-neutral-600 dark:text-neutral-300"
            >
              {t('superAdminOverviewDescription')}
            </Typography>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {superAdminLegacySections.map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800/50 dark:bg-neutral-900/50"
                >
                  <Typography
                    component="h3"
                    variant="label2-s"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {t(`superAdminModules.${item.key}.title`)}
                  </Typography>
                  <Typography
                    component="p"
                    variant="body2-r"
                    styles="mt-2 text-neutral-600 dark:text-neutral-300"
                  >
                    {t(`superAdminModules.${item.key}.description`)}
                  </Typography>
                  <div className="mt-4 flex justify-start">
                    <Button
                      variant="outline"
                      disabled={!LEGACY_PANEL_URL}
                      onClick={() => {
                        if (LEGACY_PANEL_URL) {
                          window.location.assign(
                            `${LEGACY_PANEL_URL}${item.suffix}`,
                          );
                        }
                      }}
                    >
                      {t('superAdminOpenLegacy')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-primary-500/30 bg-primary-500/[0.04] p-6 dark:border-primary-400/20 dark:bg-primary-400/[0.06]">
            <Typography
              component="h2"
              variant="h3-inter"
              styles="text-neutral-900 dark:text-neutral-100"
            >
              {t('superAdminMigrationTitle')}
            </Typography>
            <Typography
              component="p"
              variant="body2-r"
              styles="mt-2 text-neutral-700 dark:text-neutral-200"
            >
              {t('superAdminMigrationDescription')}
            </Typography>
            <div className="mt-5 flex flex-col gap-3">
              {(['native', 'hybrid', 'legacy'] as const).map((status) => (
                <div
                  key={status}
                  className="rounded-lg border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800/40 dark:bg-neutral-950/40"
                >
                  <Typography
                    component="h3"
                    variant="label2-s"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {t(`superAdminStatus.${status}.title`)}
                  </Typography>
                  <Typography
                    component="p"
                    variant="body2-r"
                    styles="mt-1 text-neutral-600 dark:text-neutral-300"
                  >
                    {t(`superAdminStatus.${status}.description`)}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800/40 dark:bg-neutral-900/60 md:p-8">
        <div className="flex flex-col gap-2">
          <Typography
            component="p"
            variant="body2-r"
            styles="max-w-3xl text-neutral-600 dark:text-neutral-300"
          >
            {isSuperAdmin ? t('superAdminDescription') : t('description')}
          </Typography>
          <Tabs
            tabs={visibleTabs.map((tab) => tab.label)}
            activeTab={activeTabIndex}
            onChangeTab={(nextTab) =>
              setActiveTab(visibleTabs[nextTab]?.id ?? visibleTabs[0].id)
            }
            styles="w-fit"
          />
        </div>

        {activeTab === AdminTab.ACCOUNTS && canManageAccounts
          ? renderAccountsTab()
          : null}
        {activeTab === AdminTab.SESSIONS && isSuperAdmin
          ? renderSessionsTab()
          : null}
        {activeTab === AdminTab.SERVERS && isSuperAdmin
          ? renderServersTab()
          : null}
        {activeTab === AdminTab.LOGS && isSuperAdmin ? renderLogsTab() : null}
        {activeTab === AdminTab.SOCIALS && isSuperAdmin
          ? renderSocialLinksTab()
          : null}
        {activeTab === AdminTab.ONLINE ? renderOnlineTab() : null}
        {activeTab === AdminTab.CHARACTERS ? renderCharacterTab() : null}
        {activeTab === AdminTab.GUILDS ? renderGuildTab() : null}
        {activeTab === AdminTab.TOOLS ? renderToolsTab() : null}
      </div>
    </div>
  );
};

export default Admin;
