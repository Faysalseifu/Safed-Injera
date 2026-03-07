import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en/translation.json';
import amTranslations from './locales/am/translation.json';

const LANGUAGE_KEY = 'sefedinjera-language';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem(LANGUAGE_KEY) || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      am: {
        translation: amTranslations,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;



