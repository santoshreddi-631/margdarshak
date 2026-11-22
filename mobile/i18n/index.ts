import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { te } from './locales/te';
import { hi } from './locales/hi';

export const resources = {
  en: {
    translation: en,
  },
  te: {
    translation: te,
  },
  hi: {
    translation: hi,
  },
} as const;

export type SupportedLocale = 'en' | 'te' | 'hi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React Native handles XSS escaping safely
    },
    react: {
      useSuspense: false, // No suspense issues in React Native SSR or loading
    },
  });

export default i18n;
