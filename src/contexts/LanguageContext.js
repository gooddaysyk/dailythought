import React, { createContext, useState, useContext, useEffect } from 'react';
import ko from '../translations/ko.json';
import en from '../translations/en.json';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ko');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // 브라우저 언어 설정 확인
      const browserLanguage = navigator.language.split('-')[0];
      setLanguage(browserLanguage === 'ko' ? 'ko' : 'en');
    }
  }, []);

  const translations = {
    ko,
    en
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value[k];
      if (!value) return key;
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 