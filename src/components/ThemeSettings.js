import React, { useState, useEffect } from 'react';
import './ThemeSettings.css';

function ThemeSettings() {
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('#4CAF50');

  useEffect(() => {
    // 저장된 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    const savedAccentColor = localStorage.getItem('accentColor');
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
      document.documentElement.style.setProperty('--accent-color', savedAccentColor);
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleAccentColorChange = (color) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('accentColor', color);
  };

  const accentColors = [
    { name: '초록', value: '#4CAF50' },
    { name: '파랑', value: '#2196F3' },
    { name: '보라', value: '#9C27B0' },
    { name: '주황', value: '#FF9800' },
    { name: '빨강', value: '#F44336' }
  ];

  return (
    <div className="theme-settings">
      <h3>테마 설정</h3>
      
      <div className="theme-controls">
        <div className="theme-mode">
          <label>테마 모드:</label>
          <div className="theme-buttons">
            <button
              className={`theme-button ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              라이트 모드
            </button>
            <button
              className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              다크 모드
            </button>
          </div>
        </div>

        <div className="accent-color">
          <label>강조 색상:</label>
          <div className="color-buttons">
            {accentColors.map((color) => (
              <button
                key={color.value}
                className={`color-button ${accentColor === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleAccentColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeSettings; 