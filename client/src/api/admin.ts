import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from './api';
import { AccountState, CharacterAttributes, CharacterDetails, Guild, Page } from './types';

export type AdminAccount = {
  id: string;
  loginName: string;
  email: string;
  registrationDate: string;
  state: AccountState;
  chatBanUntil: string | null;
};

const getAdminAccounts = async (
  page: number,
  size: number,
  search?: string,
): Promise<Page<AdminAccount>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.set('search', search);
  const response = await api.get(`/admin/accounts?${params}`);
  return response.data;
};

const changeAccountState = async (
  loginName: string,
  state: AccountState,
): Promise<AdminAccount> => {
  const response = await api.put(`/admin/accounts/${loginName}/state`, {
    state,
  });
  return response.data;
};

export const useGetAdminAccounts = (
  page: number,
  size: number,
  search?: string,
  enabled = true,
) => {
  return useQuery<Page<AdminAccount>, Error>({
    queryKey: ['admin', 'accounts', page, search],
    queryFn: () => getAdminAccounts(page, size, search),
    enabled,
  });
};

export const useChangeAccountState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      loginName,
      state,
    }: {
      loginName: string;
      state: AccountState;
    }) => changeAccountState(loginName, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
};

const kickCharacter = async (characterName: string): Promise<void> => {
  await api.patch(`/admin/characters/${characterName}/kick`);
};

const temporarilyBanCharacter = async (characterName: string): Promise<void> => {
  await api.patch(`/admin/characters/${characterName}/temporary-ban`);
};

const broadcastMessage = async ({
  serverId,
  message,
}: {
  serverId: number;
  message: string;
}): Promise<void> => {
  await api.post('/admin/broadcast', { serverId, message });
};

export const useKickCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (characterName: string) => kickCharacter(characterName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['game', 'onlines'] });
    },
  });
};

export const useTemporarilyBanCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (characterName: string) => temporarilyBanCharacter(characterName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['game', 'onlines'] });
    },
  });
};

export const useBroadcastMessage = () => {
  return useMutation({
    mutationFn: broadcastMessage,
  });
};

const getAdminCharacter = async (
  characterName: string,
): Promise<CharacterDetails> => {
  const response = await api.get(`/admin/characters/${characterName}`);
  return response.data;
};

const teleportCharacter = async ({
  characterName,
  mapName,
  x,
  y,
}: {
  characterName: string;
  mapName: string;
  x: number;
  y: number;
}): Promise<CharacterDetails> => {
  const response = await api.patch(`/admin/characters/${characterName}/teleport`, {
    mapName,
    x,
    y,
  });
  return response.data;
};

const forceResetCharacter = async (
  characterName: string,
): Promise<CharacterDetails> => {
  const response = await api.patch(`/admin/characters/${characterName}/force-reset`);
  return response.data;
};

const updateCharacterAttributesAsAdmin = async ({
  characterName,
  attributes,
}: {
  characterName: string;
  attributes: CharacterAttributes;
}): Promise<CharacterDetails> => {
  const response = await api.patch(`/admin/characters/${characterName}/attributes`, attributes);
  return response.data;
};

const getAdminGuild = async (guildName: string): Promise<Guild> => {
  const response = await api.get(`/admin/guilds/${guildName}`);
  return response.data;
};

const changeGuildMaster = async ({
  guildName,
  newMasterCharacterName,
}: {
  guildName: string;
  newMasterCharacterName: string;
}): Promise<Guild> => {
  const response = await api.patch(`/admin/guilds/${guildName}/master`, {
    newMasterCharacterName,
  });
  return response.data;
};

const disbandGuild = async (guildName: string): Promise<void> => {
  await api.delete(`/admin/guilds/${guildName}`);
};

export const useGetAdminCharacter = (
  characterName?: string,
  enabled = true,
) => {
  return useQuery<CharacterDetails, Error>({
    queryKey: ['admin', 'character', characterName],
    queryFn: () => getAdminCharacter(characterName as string),
    enabled: enabled && Boolean(characterName),
    retry: false,
  });
};

export const useTeleportCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teleportCharacter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'character', variables.characterName],
      });
    },
  });
};

export const useForceResetCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (characterName: string) => forceResetCharacter(characterName),
    onSuccess: (_, characterName) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'character', characterName],
      });
      queryClient.invalidateQueries({ queryKey: ['game', 'onlines'] });
    },
  });
};

export const useUpdateCharacterAttributesAsAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCharacterAttributesAsAdmin,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'character', variables.characterName],
      });
    },
  });
};

export const useGetAdminGuild = (guildName?: string, enabled = true) => {
  return useQuery<Guild, Error>({
    queryKey: ['admin', 'guild', guildName],
    queryFn: () => getAdminGuild(guildName as string),
    enabled: enabled && Boolean(guildName),
    retry: false,
  });
};

export const useChangeGuildMaster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeGuildMaster,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'guild', variables.guildName],
      });
    },
  });
};

export const useDisbandGuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guildName: string) => disbandGuild(guildName),
    onSuccess: (_, guildName) => {
      queryClient.removeQueries({ queryKey: ['admin', 'guild', guildName] });
    },
  });
};
