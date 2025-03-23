import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSettings.css';

function LanguageSettings() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="language-settings">
      <h3>{t('settings.language.title')}</h3>
      <div className="language-buttons">
        <button
          className={`language-button ${language === 'ko' ? 'active' : ''}`}
          onClick={() => changeLanguage('ko')}
        >
          한국어
        </button>
        <button
          className={`language-button ${language === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          English
        </button>
      </div>
    </div>
  );
}

export default LanguageSettings; 