import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { db, auth } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import 'react-calendar/dist/Calendar.css';
import { dailyQuotes } from './data/dailyQuotes';
import DataManagement from './components/DataManagement';
import ShareButton from './components/ShareButton';
import NotificationSettings from './components/NotificationSettings';
import ThemeSettings from './components/ThemeSettings';
import LanguageSettings from './components/LanguageSettings';
import { useLanguage } from './contexts/LanguageContext';
import './App.css';

function AppContent() {
  const { t } = useLanguage();
  const [todayQuote, setTodayQuote] = useState(null);
  const [userThought, setUserThought] = useState('');
  const [savedThoughts, setSavedThoughts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('quote'); // 'quote', 'thought', 'theme', 'language', 'notification', 'data'
  const [thought, setThought] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [thoughts, setThoughts] = useState([]);
  const [quote] = useState({
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  });

  const moods = {
    happy: '😊',
    sad: '😢',
    excited: '🤗',
    angry: '😠',
    neutral: '😐'
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        loadUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTodayQuote = async () => {
      try {
        // 오늘 날짜를 키로 사용
        const today = new Date().toLocaleDateString();
        const savedQuote = localStorage.getItem(`quote_${today}`);
        
        if (savedQuote) {
          setTodayQuote(JSON.parse(savedQuote));
        } else {
          setTodayQuote(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]);
          localStorage.setItem(`quote_${today}`, JSON.stringify(todayQuote));
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayQuote();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const thoughtsRef = collection(db, 'thoughts');
      const thoughtsQuery = query(thoughtsRef, where('userId', '==', userId));
      const thoughtsSnapshot = await getDocs(thoughtsQuery);
      const thoughts = thoughtsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedThoughts(thoughts);

      const bookmarksRef = doc(db, 'bookmarks', userId);
      const bookmarksDoc = await getDoc(bookmarksRef);
      if (bookmarksDoc.exists()) {
        setBookmarks(bookmarksDoc.data().bookmarks || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSavedThoughts([]);
      setBookmarks([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleThoughtSubmit = (e) => {
    e.preventDefault();
    if (thought.trim()) {
      const newThought = {
        id: Date.now(),
        text: thought,
        date: new Date().toISOString(),
        quote: { ...quote }
      };
      setThoughts([newThought, ...thoughts]);
      setThought('');
    }
  };

  const filteredThoughts = thoughts.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.quote.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'quote':
        return (
          <div className="quote-section">
            <h2>{t('dailyQuote.title')}</h2>
            <div className="quote-content">
              <p>"{quote.text}"</p>
              <p className="quote-author">- {quote.author}</p>
            </div>
            <ShareButton quote={quote} thought={thought} />
            
            <div className="thought-input-section">
              <h3>{t('thought.title')}</h3>
              <form onSubmit={handleThoughtSubmit}>
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder={t('thought.placeholder')}
                />
                <button type="submit">{t('thought.submit')}</button>
              </form>
            </div>

            <div className="thoughts-list-section">
              <h3>{t('thought.list')}</h3>
              <div className="search-box">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dailyQuote.search')}
                />
              </div>
              <div className="thoughts-list">
                {filteredThoughts.length > 0 ? (
                  filteredThoughts.map(item => (
                    <div key={item.id} className="thought-item">
                      <div className="thought-quote">
                        <p>"{item.quote.text}"</p>
                        <p className="quote-author">- {item.quote.author}</p>
                      </div>
                      <div className="thought-text">
                        <p>{item.text}</p>
                        <p className="thought-date">
                          {new Date(item.date).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">{t('thought.empty')}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'theme':
        return <ThemeSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'notification':
        return <NotificationSettings />;
      case 'data':
        return (
          <DataManagement 
            user={user}
            savedThoughts={savedThoughts || []}
            setSavedThoughts={setSavedThoughts}
            bookmarks={bookmarks || []}
            setBookmarks={setBookmarks}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <div className="auth-buttons">
          {user ? (
            <div className="user-info">
              {user.photoURL && (
                <img src={user.photoURL} alt="Profile" className="profile-image" />
              )}
              <span className="user-name">{user.displayName}</span>
              <button onClick={handleLogout} className="logout-button">
                {t('app.logout')}
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="login-button">
              {t('app.login')}
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {!user ? (
          <div className="login-prompt">
            <h2>{t('app.welcomeTitle')}</h2>
            <p>{t('app.loginPrompt')}</p>
            <button onClick={handleLogin} className="login-button-large">
              {t('app.loginWithGoogle')}
            </button>
          </div>
        ) : (
          <div className="content-wrapper">
            <nav className="side-menu">
              <button
                className={`menu-button ${activeMenu === 'quote' ? 'active' : ''}`}
                onClick={() => setActiveMenu('quote')}
              >
                {t('menu.dailyQuote')}
              </button>
              <button
                className={`menu-button ${activeMenu === 'theme' ? 'active' : ''}`}
                onClick={() => setActiveMenu('theme')}
              >
                {t('menu.theme')}
              </button>
              <button
                className={`menu-button ${activeMenu === 'language' ? 'active' : ''}`}
                onClick={() => setActiveMenu('language')}
              >
                {t('menu.language')}
              </button>
              <button
                className={`menu-button ${activeMenu === 'notification' ? 'active' : ''}`}
                onClick={() => setActiveMenu('notification')}
              >
                {t('menu.notification')}
              </button>
              <button
                className={`menu-button ${activeMenu === 'data' ? 'active' : ''}`}
                onClick={() => setActiveMenu('data')}
              >
                {t('menu.data')}
              </button>
            </nav>

            <main className="content">
              {renderContent()}
            </main>
          </div>
        )}
      </main>
    </div>
  );
}

export default AppContent; 