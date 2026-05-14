import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    // Settings
    settings: 'Settings',
    customizeExperience: 'Customize your experience',
    appearance: 'Appearance',
    theme: 'Theme',
    language: 'Language',
    themeChanged: 'Theme changed',
    languageChanged: 'Language changed',
    
    // Privacy & Status
    privacyStatus: 'Privacy & Status',
    showOnlineStatus: 'Show Online Status',
    letOthersSeeWhenOnline: 'Let others see when you\'re online',
    customStatus: 'Custom Status',
    whatsOnYourMind: 'What\'s on your mind?',
    saveStatus: 'Save Status',
    statusUpdated: 'Status updated',
    
    // Notifications
    notifications: 'Notifications',
    enableNotifications: 'Enable Notifications',
    getNotifiedAboutMessages: 'Get notified about new messages and updates',
    
    // Account
    account: 'Account',
    logout: 'Logout',
    
    // Common
    dark: 'Dark',
    light: 'Light',
    save: 'Save',
    cancel: 'Cancel',
    error: 'Error',
    success: 'Success',
  },
  ru: {
    // Settings
    settings: 'Параметры',
    customizeExperience: 'Настройте свой опыт',
    appearance: 'Внешний вид',
    theme: 'Тема',
    language: 'Язык',
    themeChanged: 'Тема изменена',
    languageChanged: 'Язык изменён',
    
    // Privacy & Status
    privacyStatus: 'Приватность и статус',
    showOnlineStatus: 'Показать статус онлайна',
    letOthersSeeWhenOnline: 'Позволить другим видеть, когда вы онлайн',
    customStatus: 'Пользовательский статус',
    whatsOnYourMind: 'О чём вы думаете?',
    saveStatus: 'Сохранить статус',
    statusUpdated: 'Статус обновлён',
    
    // Notifications
    notifications: 'Уведомления',
    enableNotifications: 'Включить уведомления',
    getNotifiedAboutMessages: 'Получать уведомления о новых сообщениях и обновлениях',
    
    // Account
    account: 'Аккаунт',
    logout: 'Выход',
    
    // Common
    dark: 'Тёмная',
    light: 'Светлая',
    save: 'Сохранить',
    cancel: 'Отмена',
    error: 'Ошибка',
    success: 'Успешно',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language') || 'en';
    return saved;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
