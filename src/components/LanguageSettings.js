import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSettings.css';

function LanguageSettings() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="settings-section">
      <h2>언어 설정</h2>
      <div className="settings-content">
        <div className="setting-item">
          <label>언어 선택:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default LanguageSettings; 