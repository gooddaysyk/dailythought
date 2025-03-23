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

  const handleShare = (platform) => {
    const shareText = getShareText();
    const encodedText = encodeURIComponent(shareText);
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`;
        break;
      case 'instagram':
        handleCopy(shareText);
        alert(t('share.instagram'));
        return;
      case 'kakao':
        handleCopy(shareText);
        alert(t('share.kakao'));
        return;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
    setShowOptions(false);
  };

  const handleCopy = async (text = getShareText()) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(t('share.copied'));
      setShowOptions(false);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="share-container">
      <button 
        className="share-button"
        onClick={() => setShowOptions(!showOptions)}
      >
        {t('share.title')}
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
            <button onClick={() => handleShare('twitter')}>
              {t('share.twitter')}
            </button>
            <button onClick={() => handleShare('facebook')}>
              {t('share.facebook')}
            </button>
            <button onClick={() => handleShare('instagram')}>
              {t('share.instagram')}
            </button>
            <button onClick={() => handleShare('kakao')}>
              {t('share.kakao')}
            </button>
            <button onClick={() => handleCopy()}>
              {t('share.copy')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareButton; 