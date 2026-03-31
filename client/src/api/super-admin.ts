import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from './api';
import type { Account, AccountState } from './types';

export type LoggedInAccount = {
  loginName: string;
  serverId: number;
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

const getLoggedInAccounts = async (): Promise<LoggedInAccount[]> => {
  const response = await api.get('/super-admin/runtime/logged-in');
  return response.data;
};

const disconnectLoggedInAccount = async ({
  loginName,
  serverId,
}: LoggedInAccount): Promise<void> => {
  await api.post(`/super-admin/runtime/logged-in/${encodeURIComponent(loginName)}/disconnect`, null, {
    params: { serverId },
  });
};

const getManagedAccount = async (loginName: string): Promise<Account> => {
  const response = await api.get(`/super-admin/accounts/${encodeURIComponent(loginName)}`);
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
