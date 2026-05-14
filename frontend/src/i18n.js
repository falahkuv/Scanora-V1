import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

// Baca dari localStorage. Kalau belum pernah disimpan, default ke Bahasa Indonesia.
const savedLang = localStorage.getItem('i18nextLng');
const activeLang = savedLang === 'en' ? 'en' : 'id';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: activeLang,
    fallbackLng: 'id',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
