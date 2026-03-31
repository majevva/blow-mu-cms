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
) => {
  return useQuery<Page<AdminAccount>, Error>({
    queryKey: ['admin', 'accounts', page, search],
    queryFn: () => getAdminAccounts(page, size, search),
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
