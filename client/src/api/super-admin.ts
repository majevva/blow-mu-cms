import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from './api';
import type { Account, AccountState, BetaSocialLinks } from './types';

export type LoggedInAccount = {
  loginName: string;
  serverId: number;
};

export type ManageableServer = {
  id: number;
  configurationId: string;
  description: string;
  type: string;
  serverState: string;
  currentConnections: number;
  maximumConnections: number;
};

export type LogFileEntry = {
  name: string;
  lastUpdatedAt: string;
  sizeBytes: number;
  sizeLabel: string;
  downloadPath: string;
};

export type ManagedAccountCreateInput = {
  loginName: string;
  email: string;
  password: string;
  securityCode: string;
  state: AccountState;
};

export type ManagedAccountUpdateInput = {
  email: string;
  securityCode: string;
  state: AccountState;
  vaultPassword: string;
  vaultExtended: boolean;
  nextPassword: string;
};

export type BetaSocialLinksUpdateInput = {
  instagramUrl: string;
  discordUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
};

const getLoggedInAccounts = async (): Promise<LoggedInAccount[]> => {
  const response = await api.get('/super-admin/runtime/logged-in');
  return response.data;
};

const disconnectLoggedInAccount = async ({
  loginName,
  serverId,
}: LoggedInAccount): Promise<void> => {
  await api.post(
    `/super-admin/runtime/logged-in/${encodeURIComponent(
      loginName,
    )}/disconnect`,
    null,
    {
      params: { serverId },
    },
  );
};

const getManagedAccount = async (loginName: string): Promise<Account> => {
  const response = await api.get(
    `/super-admin/accounts/${encodeURIComponent(loginName)}`,
  );
  return response.data;
};

const getManageableServers = async (): Promise<ManageableServer[]> => {
  const response = await api.get('/super-admin/runtime/servers');
  return response.data;
};

const startManageableServer = async (serverId: number): Promise<void> => {
  await api.post(`/super-admin/runtime/servers/${serverId}/start`);
};

const stopManageableServer = async (serverId: number): Promise<void> => {
  await api.post(`/super-admin/runtime/servers/${serverId}/stop`);
};

const removeManageableServer = async ({
  serverId,
  type,
}: {
  serverId: number;
  type: string;
}): Promise<void> => {
  await api.delete(`/super-admin/runtime/servers/${serverId}`, {
    params: { type },
  });
};

const restartAllManageableServers = async (): Promise<void> => {
  await api.post('/super-admin/runtime/servers/restart-all');
};

const getLogFiles = async (): Promise<LogFileEntry[]> => {
  const response = await api.get('/super-admin/runtime/logfiles');
  return response.data;
};

const getBetaSocialLinks = async (): Promise<BetaSocialLinks> => {
  const response = await api.get('/super-admin/settings/social-links');
  return response.data;
};

const updateBetaSocialLinks = async (
  payload: BetaSocialLinksUpdateInput,
): Promise<BetaSocialLinks> => {
  const response = await api.put('/super-admin/settings/social-links', payload);
  return response.data;
};

const createManagedAccount = async (
  payload: ManagedAccountCreateInput,
): Promise<Account> => {
  const response = await api.post('/super-admin/accounts', payload);
  return response.data;
};

const updateManagedAccount = async ({
  loginName,
  payload,
}: {
  loginName: string;
  payload: ManagedAccountUpdateInput;
}): Promise<Account> => {
  const response = await api.put(
    `/super-admin/accounts/${encodeURIComponent(loginName)}`,
    payload,
  );
  return response.data;
};

export const useGetLoggedInAccounts = (enabled = true) => {
  return useQuery<LoggedInAccount[], Error>({
    queryKey: ['super-admin', 'runtime', 'logged-in'],
    queryFn: () => getLoggedInAccounts(),
    enabled,
  });
};

export const useDisconnectLoggedInAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectLoggedInAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'runtime', 'logged-in'],
      });
    },
  });
};

export const useGetManagedAccount = (loginName?: string, enabled = true) => {
  return useQuery<Account, Error>({
    queryKey: ['super-admin', 'accounts', loginName],
    queryFn: () => getManagedAccount(loginName as string),
    enabled: enabled && Boolean(loginName),
  });
};

export const useGetManageableServers = (enabled = true) => {
  return useQuery<ManageableServer[], Error>({
    queryKey: ['super-admin', 'runtime', 'servers'],
    queryFn: () => getManageableServers(),
    enabled,
  });
};

export const useGetLogFiles = (enabled = true) => {
  return useQuery<LogFileEntry[], Error>({
    queryKey: ['super-admin', 'runtime', 'logfiles'],
    queryFn: () => getLogFiles(),
    enabled,
  });
};

export const useGetBetaSocialLinks = (enabled = true) => {
  return useQuery<BetaSocialLinks, Error>({
    queryKey: ['super-admin', 'settings', 'social-links'],
    queryFn: () => getBetaSocialLinks(),
    enabled,
  });
};

export const useCreateManagedAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManagedAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
};

export const useUpdateManagedAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateManagedAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'accounts', variables.loginName],
      });
    },
  });
};

export const useUpdateBetaSocialLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBetaSocialLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'settings', 'social-links'],
      });
      queryClient.invalidateQueries({
        queryKey: ['game', 'social-links'],
      });
    },
  });
};

export const useStartManageableServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startManageableServer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'runtime', 'servers'],
      });
    },
  });
};

export const useStopManageableServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopManageableServer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'runtime', 'servers'],
      });
    },
  });
};

export const useRemoveManageableServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeManageableServer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'runtime', 'servers'],
      });
    },
  });
};

export const useRestartAllManageableServers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restartAllManageableServers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin', 'runtime', 'servers'],
      });
    },
  });
};
