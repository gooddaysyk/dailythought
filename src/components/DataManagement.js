import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './DataManagement.css';

function DataManagement({ user, savedThoughts, setSavedThoughts, bookmarks, setBookmarks }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const { t } = useLanguage();

  const handleExport = () => {
    setIsExporting(true);
    try {
      const data = {
        thoughts: savedThoughts,
        bookmarks: bookmarks,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dailythought-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event) => {
    setIsImporting(true);
    setImportError('');
    
    const file = event.target.files[0];
    if (!file) {
      setIsImporting(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // 데이터 유효성 검사
        if (!data.thoughts || !data.bookmarks) {
          throw new Error('Invalid data format');
        }

        // 데이터 가져오기
        setSavedThoughts(data.thoughts);
        setBookmarks(data.bookmarks);
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('savedThoughts', JSON.stringify(data.thoughts));
        localStorage.setItem('bookmarks', JSON.stringify(data.bookmarks));
        
        // 파일 입력 초기화
        event.target.value = '';
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        setImportError(t('settings.data.importError'));
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setImportError(t('settings.data.importError'));
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="data-management">
      <h3>데이터 관리</h3>
      
      <div className="data-actions">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '내보내는 중...' : '데이터 내보내기'}
        </button>

        <div className="import-section">
          <input
            type="file"
            id="import-file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="import-file"
            className={`import-button ${isImporting ? 'disabled' : ''}`}
          >
            {isImporting ? '가져오는 중...' : '데이터 가져오기'}
          </label>
        </div>
      </div>

      {importError && (
        <p className="error-message">{importError}</p>
      )}

      <div className="data-info">
        <p>저장된 생각: {savedThoughts.length}개</p>
        <p>북마크된 명언: {bookmarks.length}개</p>
      </div>
    </div>
  );
}

export default DataManagement; 