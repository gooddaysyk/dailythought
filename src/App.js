import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppContent from './AppContent';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <AppContent />
      </div>
    </LanguageProvider>
  );
}

export default App; 