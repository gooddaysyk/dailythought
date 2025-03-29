import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppContent from './AppContent';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="app">
          <h1 className="app-title">Daily Thought</h1>
          <AppContent />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App; 