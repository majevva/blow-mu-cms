import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as en from './locale/en.json';
import * as pt from './locale/pt.json';
import * as pl from './locale/pl.json';

const supportedLanguages = ['pl', 'en', 'pt'] as const;
const storedLanguage = localStorage.getItem('language') || 'pl';
const defaultLanguage = supportedLanguages.includes(
  storedLanguage as (typeof supportedLanguages)[number],
)
  ? storedLanguage
  : 'pl';

i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: pl },
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: defaultLanguage,
  fallbackLng: 'pl',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
