import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { AuthContext } from '@/contexts/AuthContext';
import { AccountState, JWTPayload } from '@/api/types';
import {
  useGetAdminAccounts,
  useChangeAccountState,
  type AdminAccount,
} from '@/api/admin';
import useBaseTranslation from '@/hooks/use-base-translation';

import Table from '@/components/Table/Table';
import Typography from '@/components/Typography/Typography';
import Pagination from '@/components/Pagination/Pagination';
import Button from '@/components/Button/Button';
import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import LoadingTableBody from '@/components/Table/LoadingTableBody';
import TableEmptyMessage from '@/components/Table/TableEmptyMessage/TableEmptyMessage';

const PAGE_SIZE = 10;

const STATE_COLORS: Record<AccountState, string> = {
  [AccountState.NORMAL]: 'text-green-500',
  [AccountState.GAME_MASTER]: 'text-blue-500',
  [AccountState.GAME_MASTER_INVISIBLE]: 'text-blue-400',
  [AccountState.SPECTATOR]: 'text-neutral-400',
  [AccountState.BANNED]: 'text-red-500',
  [AccountState.TEMPORARILY_BANNED]: 'text-orange-500',
};

const Admin: React.FC = () => {
  const { auth } = useContext(AuthContext);
  const { t } = useBaseTranslation('admin');

  const jwtPayload: JWTPayload = jwtDecode(auth.token as string);
  const isAdmin =
    jwtPayload.role === AccountState.GAME_MASTER ||
    jwtPayload.role === AccountState.GAME_MASTER_INVISIBLE;

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingStates, setPendingStates] = useState<
    Record<string, AccountState>
  >({});

  if (!isAdmin) return <Navigate to="/" />;

  const { data, isLoading } = useGetAdminAccounts(
    currentPage - 1,
    PAGE_SIZE,
    search || undefined,
  );

  const { mutate: updateState, isPending } = useChangeAccountState();

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
      },
    );
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

  return (
    <div className="flex flex-col gap-6">
      <TitleWithDivider>{t('title')}</TitleWithDivider>

      <input
        className="h-10 w-full rounded-[4px] border border-neutral-300 p-2 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={handleSearchChange}
      />

      <div className="flex flex-col gap-2 overflow-x-auto">
        <Table columns={columns}>
          {isLoading ? (
            <LoadingTableBody />
          ) : data?.content.length === 0 ? (
            <TableEmptyMessage message={t('emptyMessage')} type="page" />
          ) : (
            data?.content.map((account, index) => {
              const isLast = index === (data?.content.length ?? 0) - 1;
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
                    styles="text-neutral-900 dark:text-neutral-100 px-2 py-2"
                  >
                    {account.loginName}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="text-neutral-900 dark:text-neutral-100 px-2 py-2"
                  >
                    {account.email}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles={`text-center px-2 py-2 font-semibold ${STATE_COLORS[account.state]}`}
                  >
                    {t(`states.${account.state}`)}
                  </Typography>
                  <Typography
                    component="td"
                    variant="label2-r"
                    styles="text-neutral-900 dark:text-neutral-100 text-center px-2 py-2"
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
                        disabled={isPending || !isDirty}
                        onClick={() => handleSave(account)}
                      >
                        {t('saveState')}
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
          totalPages={Math.max(data?.totalPages ?? 1, currentPage)}
        />
      </div>
    </div>
  );
};

export default Admin;
