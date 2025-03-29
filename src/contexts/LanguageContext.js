import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  ko: {
    app: {
      title: 'Daily Thought',
      login: '로그인',
      logout: '로그아웃'
    },
    dailyQuote: {
      title: '오늘의 명언',
      search: '검색어를 입력하세요'
    },
    thought: {
      title: '나의 생각',
      placeholder: '이 명언에 대한 나의 생각을 적어보세요...',
      submit: '저장하기',
      list: '나의 기록',
      empty: '아직 작성된 글이 없습니다.'
    },
    settings: {
      theme: {
        title: '테마 설정',
        light: '밝은 테마',
        dark: '어두운 테마',
        system: '시스템 설정'
      },
      language: {
        title: '언어 설정',
        ko: '한국어',
        en: 'English'
      },
      notification: {
        title: '알림 설정',
        enabled: '알림 켜기',
        disabled: '알림 끄기',
        time: '알림 시간',
        daily: '매일 새로운 명언 알림',
        weekly: '주간 리마인더',
        email: '이메일 알림'
      }
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ko');

  const value = {
    language,
    setLanguage,
    t: (key) => {
      const keys = key.split('.');
      let result = translations[language];
      for (const k of keys) {
        result = result?.[k];
      }
      return result || key;
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 