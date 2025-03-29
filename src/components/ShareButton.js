import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './ShareButton.css';

function ShareButton({ quote, thought }) {
  const [showOptions, setShowOptions] = useState(false);
  const [shareMode, setShareMode] = useState('quoteOnly'); // 'quoteOnly' or 'quoteAndThought'
  const { t } = useLanguage();

  const getShareText = () => {
    if (shareMode === 'quoteOnly') {
      return `"${quote.text}" - ${quote.author}`;
    } else {
      return `"${quote.text}" - ${quote.author}\n\n${t('thought.title')}: ${thought}`;
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    setShowOptions(false);
  };

  const handleFacebookShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
    setShowOptions(false);
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(getShareText());
    alert(t('share.instagram'));
    setShowOptions(false);
  };

  const handleKakaoShare = () => {
    navigator.clipboard.writeText(getShareText());
    alert(t('share.kakao'));
    setShowOptions(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(getShareText());
    alert(t('share.copied'));
    setShowOptions(false);
  };

  return (
    <div className="share-container">
      <button 
        className="share-button"
        onClick={() => setShowOptions(!showOptions)}
      >
        공유
      </button>
      
      {showOptions && (
        <div className="share-options">
          <div className="share-mode-buttons">
            <button
              className={`mode-button ${shareMode === 'quoteOnly' ? 'active' : ''}`}
              onClick={() => setShareMode('quoteOnly')}
            >
              {t('share.quoteOnly')}
            </button>
            <button
              className={`mode-button ${shareMode === 'quoteAndThought' ? 'active' : ''}`}
              onClick={() => setShareMode('quoteAndThought')}
              disabled={!thought}
            >
              {t('share.quoteAndThought')}
            </button>
          </div>
          <div className="share-platform-buttons">
            <button onClick={handleTwitterShare}>
              {t('share.twitter')}
            </button>
            <button onClick={handleFacebookShare}>
              {t('share.facebook')}
            </button>
            <button onClick={handleInstagramShare}>
              {t('share.instagram')}
            </button>
            <button onClick={handleKakaoShare}>
              {t('share.kakao')}
            </button>
            <button onClick={handleCopyToClipboard}>
              {t('share.copy')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareButton; 