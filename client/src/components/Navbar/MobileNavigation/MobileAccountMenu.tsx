import React, { useContext, useEffect, createRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '@/contexts/AuthContext';

import useBaseTranslation from '@/hooks/use-base-translation';
import {
  canAccessGameMasterPanel,
  canManageContent,
  getAccountRole,
  getAdminLandingPath,
} from '@/auth/authorization';

import Typography from '../../Typography/Typography';

type MobileAccountMenuProps = {
  onClose: () => void;
  show: boolean;
};

const MobileAccountMenu: React.FC<MobileAccountMenuProps> = ({
  onClose,
  show,
}) => {
  const navigate = useNavigate();
  const { t } = useBaseTranslation('sidebar.accountCard.menuOptions');
  const { signOut, auth } = useContext(AuthContext);
  const mobileMenuRef = createRef<HTMLDivElement>();
  const role = getAccountRole(auth.token);

  const handleClickOutside = (event: MouseEvent) => {
    const modalElement = document.getElementById('mobile-account-menu');
    const targetElement = event.target as HTMLElement;

    if (!modalElement || !modalElement.contains(targetElement)) {
      if (!targetElement.closest('svg[account-button]')) {
        onClose();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {show ? (
        <div
          id="mobile-account-menu"
          className={`absolute right-0 top-11 z-[1] flex w-36 origin-right transform flex-col gap-2
                      rounded-l-lg bg-white py-2 text-center shadow-lg transition-all dark:bg-neutral-900 dark:border dark:border-neutral-800
                      ${show ? 'animate-scale-x' : 'animate-scale-x-out'}`}
          ref={mobileMenuRef}
        >
          <ul className="flex flex-col gap-1">
            <li>
              <Typography
                component="button"
                variant="label2-r"
                styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={() => {
                  navigate('/my-account');
                  onClose();
                }}
              >
                {t('myAccount')}
              </Typography>
            </li>
            {canManageContent(role) && (
              <>
                <li>
                  <Typography
                    component="button"
                    variant="label2-r"
                    styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => {
                      navigate('/news/add');
                      onClose();
                    }}
                  >
                    {t('addNews')}
                  </Typography>
                </li>
                <li>
                  <Typography
                    component="button"
                    variant="label2-r"
                    styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => {
                      navigate('/banners');
                      onClose();
                    }}
                  >
                    {t('banners')}
                  </Typography>
                </li>
                <li>
                  <Typography
                    component="button"
                    variant="label2-r"
                    styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => {
                      navigate(getAdminLandingPath(role));
                      onClose();
                    }}
                  >
                    {t(
                      role === 'SUPER_ADMIN' ? 'superAdminPanel' : 'gmPanel',
                    )}
                  </Typography>
                </li>
              </>
            )}
            {!canManageContent(role) && canAccessGameMasterPanel(role) && (
              <li>
                <Typography
                  component="button"
                  variant="label2-r"
                  styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  onClick={() => {
                    navigate(getAdminLandingPath(role));
                    onClose();
                  }}
                >
                  {t(role === 'SUPER_ADMIN' ? 'superAdminPanel' : 'gmPanel')}
                </Typography>
              </li>
            )}
            <li>
              <Typography
                component="button"
                variant="label2-r"
                styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation();
                  signOut();
                  onClose();
                }}
              >
                {t('logout')}
              </Typography>
            </li>
          </ul>
        </div>
      ) : null}
    </>
  );
};

export default MobileAccountMenu;
