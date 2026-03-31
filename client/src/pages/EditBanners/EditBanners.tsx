import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '@/contexts/AuthContext';
import { useGetBanners } from '@/api/banners';
import { canManageContent, getAccountRole } from '@/auth/authorization';

import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import BannersForm from './BannersForm';

type EditBannersPageProps = Record<string, never>;

const EditBannersPage: React.FC<EditBannersPageProps> = () => {
  const { auth } = useContext(AuthContext);
  const { t } = useTranslation();
  const hasPrivilege = canManageContent(getAccountRole(auth.token));

  if (!hasPrivilege) return <Navigate to="/" />;

  const { data: banners, isLoading } = useGetBanners();

  return (
    <>
      <TitleWithDivider>{t('editBanners.title')}</TitleWithDivider>
      <div className="flex w-full flex-col gap-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800/40 dark:bg-neutral-900/60 md:p-12">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <BannersForm banners={banners || []} />
        )}
      </div>
    </>
  );
};

export default EditBannersPage;
