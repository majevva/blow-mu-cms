import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from './api';
import { AccountState, Page } from './types';

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
