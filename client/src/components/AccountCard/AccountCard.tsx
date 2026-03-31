import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { AuthContext } from '@/contexts/AuthContext';
import useBaseTranslation from '@/hooks/use-base-translation';
import {
  canAccessGameMasterPanel,
  canManageContent,
  getAccountRole,
  getAdminLandingPath,
} from '@/auth/authorization';

import TitleWithDivider from '../TitleWithDivider/TitleWithDivider';
import Button from '../Button/Button';

type AccountCardProps = Record<string, never>;

const AccountCard: React.FC<AccountCardProps> = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useBaseTranslation('sidebar.accountCard');
  const { signOut, auth } = useContext(AuthContext);
  const role = getAccountRole(auth.token);

  return (
    <>
      <div className="flex min-w-80 flex-col gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-primary-800/20 dark:bg-neutral-900/70 backdrop-blur-sm">
        <TitleWithDivider twoDividers>{t('title')}</TitleWithDivider>
        <Button
          variant="ghost1"
          styles="mx-auto"
          onClick={() => navigate('/my-account')}
        >
          {t('menuOptions.myAccount')}
        </Button>
        {canManageContent(role) && (
          <>
            <Button
              variant="ghost1"
              styles="mx-auto"
              onClick={() => navigate('/news/add')}
            >
              {t('menuOptions.addNews')}
            </Button>
            <Button
              variant="ghost1"
              styles="mx-auto"
              onClick={() => navigate('/banners')}
            >
              {t('menuOptions.banners')}
            </Button>
          </>
        )}
        {canAccessGameMasterPanel(role) && (
          <>
            <Button
              variant="ghost1"
              styles="mx-auto"
              onClick={() => navigate(getAdminLandingPath(role))}
            >
              {t(
                role === 'SUPER_ADMIN'
                  ? 'menuOptions.superAdminPanel'
                  : 'menuOptions.gmPanel',
              )}
            </Button>
          </>
        )}
        <Button
          variant="ghost1"
          styles="mx-auto"
          onClick={() => {
            signOut();
            queryClient.resetQueries();
          }}
        >
          {t('menuOptions.logout')}
        </Button>
      </div>
    </>
  );
};

export default AccountCard;
