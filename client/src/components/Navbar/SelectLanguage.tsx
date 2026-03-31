import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

type SelectLanguageProps = Record<string, never>;

type LanguageOption = {
  code: 'pl' | 'en' | 'pt';
  label: string;
  shortLabel: string;
  flag: string;
};

const SelectLanguage: React.FC<SelectLanguageProps> = () => {
  const { t, i18n } = useTranslation();
  const {
    changeLanguage,
    language,
  } = i18n;
  const [openMenu, setOpenMenu] = useState(false);

  const languageOptions: LanguageOption[] = useMemo(
    () => [
      {
        code: 'pl',
        label: t('common.languageNames.pl'),
        shortLabel: t('common.shortLanguageNames.pl'),
        flag: '🇵🇱',
      },
      {
        code: 'en',
        label: t('common.languageNames.en'),
        shortLabel: t('common.shortLanguageNames.en'),
        flag: '🇬🇧',
      },
      {
        code: 'pt',
        label: t('common.languageNames.pt'),
        shortLabel: t('common.shortLanguageNames.pt'),
        flag: '🇧🇷',
      },
    ],
    [t],
  );

  const currentLanguage =
    languageOptions.find((option) => option.code === language) || languageOptions[0];

  const onChangeLanguage = (newLanguage: LanguageOption['code']) => {
    if (language !== newLanguage) {
      localStorage.setItem('language', newLanguage);
      changeLanguage(newLanguage);
    }

    setOpenMenu(false);
  };

  return (
    <>
      <div className="relative hidden self-center md:block">
        <button
          type="button"
          className="flex h-8 min-w-12 items-center justify-center gap-1 rounded-md border border-primary-400/50 px-2 text-xs font-semibold text-primary-700 hover:bg-primary-50 dark:border-primary-600/40 dark:text-primary-300 dark:hover:bg-primary-900/30 transition-colors duration-150"
          onClick={() => setOpenMenu(!openMenu)}
          aria-label={currentLanguage.label}
        >
          <span aria-hidden="true">{currentLanguage.flag}</span>
          <span>{currentLanguage.shortLabel}</span>
        </button>
        {openMenu && (
          <menu
            className={`absolute right-0 z-[1] mt-1 flex min-w-24 origin-top transform flex-col gap-1 rounded-md border border-neutral-200 bg-white p-2 text-center shadow-lg transition-all dark:border-neutral-700 dark:bg-neutral-900 ${
              openMenu ? 'animate-scale-y' : 'animate-scale-y-out'
            }`}
          >
            {languageOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm text-neutral-700 hover:bg-primary-50 dark:text-neutral-300 dark:hover:bg-primary-900/30 transition-colors duration-150"
                onClick={() => onChangeLanguage(option.code)}
              >
                <span aria-hidden="true">{option.flag}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </menu>
        )}
      </div>
    </>
  );
};

export default SelectLanguage;
