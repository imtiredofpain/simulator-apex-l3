import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/translation.en.json'; // Путь к файлам перевода
import translationRU from './locales/translation.ru.json';

const loadLanguageFromStorage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    return savedLanguage;
  }
  return detectUserLanguage() || 'ru'; // язык по умолчанию
};

// Функция для автоопределения языка из браузера пользователя
const detectUserLanguage = () => {
  const userLanguage = navigator.language;
  return userLanguage.split('-')[0]; // Используйте только основной язык (например, 'en' вместо 'en-US')
};

i18n
  .use(initReactI18next) // передаем react-i18next в i18n
  .init({
    resources: {
      en: {
        translation: translationEN,
      },
      ru: {
        translation: translationRU,
      },
    },
    lng: loadLanguageFromStorage(), // язык по умолчанию
    fallbackLng: 'ru', // язык, на который перейдет при отсутствии перевода для текущего ключа
    interpolation: {
      escapeValue: false, // react уже предоставляет защиту от XSS
    },
  });

export default i18n;
