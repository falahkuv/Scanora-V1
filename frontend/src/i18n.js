import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationID from './locales/id/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  id: {
    translation: translationID,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'id', // Default to Indonesian
    fallbackLng: 'id',
    debug: false,
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
