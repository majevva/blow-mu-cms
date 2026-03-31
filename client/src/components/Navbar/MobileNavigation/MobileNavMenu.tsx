import React, { createRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Typography from '../../Typography/Typography';
import SelectTheme from '../SelectTheme';

type MobileNavMenuProps = {
  onClose: () => void;
  show: boolean;
  navButtons: {
    label: string;
    to: string;
  }[];
};

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  show,
  navButtons,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    changeLanguage,
    language,
  } = i18n;
  const mobileMenuRef = createRef<HTMLDivElement>();
  const languageOptions = useMemo(
    () => [
      { code: 'pl', label: t('common.languageNames.pl'), flag: '🇵🇱' },
      { code: 'en', label: t('common.languageNames.en'), flag: '🇬🇧' },
      { code: 'pt', label: t('common.languageNames.pt'), flag: '🇧🇷' },
    ],
    [t],
  );

  const handleClickOutside = (event: MouseEvent) => {
    const modalElement = document.getElementById('mobile-nav-popup-menu');
    const targetElement = event.target as HTMLElement;

    if (!modalElement || !modalElement.contains(targetElement)) {
      if (!targetElement.closest('svg[menu-button]')) {
        onClose();
      }
    }
  };

  const onChangeLanguage = (newLanguage: string) => {
    if (language !== newLanguage) {
      localStorage.setItem('language', newLanguage);
      changeLanguage(newLanguage);
    }

    onClose();
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {show ? (
        <div
          id="mobile-nav-popup-menu"
          className={`absolute top-10 z-[1] flex w-44 origin-left transform flex-col gap-2 rounded-r-lg bg-white py-2 text-center shadow-lg transition-all dark:bg-neutral-900 dark:border dark:border-neutral-800 ${
            show ? 'animate-scale-x' : 'animate-scale-x-out'
          }`}
          ref={mobileMenuRef}
        >
          <ul className="flex flex-col gap-1">
            {navButtons.map((navButton, index) => (
              <Typography
                key={index}
                component="li"
                variant="label2-r"
                styles="text-[14px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={() => {
                  onClose();
                  navigate(navButton.to);
                }}
              >
                {navButton.label}
              </Typography>
            ))}
          </ul>
          <hr className="mx-2 h-[1px] bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex flex-col gap-1 px-3">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                className={`flex items-center gap-2 rounded px-2 py-1 text-left text-sm ${
                  language === option.code
                    ? 'bg-primary-100 font-semibold text-primary-700 dark:bg-primary-800/40 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
                onClick={() => onChangeLanguage(option.code)}
              >
                <span aria-hidden="true">{option.flag}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <SelectTheme onChangeTheme={onClose} />
        </div>
      ) : null}
    </>
  );
};

export default MobileNavMenu;
