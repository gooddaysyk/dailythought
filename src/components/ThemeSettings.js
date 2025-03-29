import React, { useState, useEffect } from 'react';
import './ThemeSettings.css';
import { useTheme } from '../contexts/ThemeContext';

function ThemeSettings() {
  const { theme, setTheme } = useTheme();
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
    <div className="settings-section">
      <h2>테마 설정</h2>
      <div className="settings-content">
        <div className="setting-item">
          <label>테마 선택:</label>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value)}
          >
            <option value="light">밝은 테마</option>
            <option value="dark">어두운 테마</option>
            <option value="system">시스템 설정</option>
          </select>
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