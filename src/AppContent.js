import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { db, auth } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, getAuth } from 'firebase/auth';
import 'react-calendar/dist/Calendar.css';
import { dailyQuotes } from './data/dailyQuotes';
import DataManagement from './components/DataManagement';
import ShareButton from './components/ShareButton';
import NotificationSettings from './components/NotificationSettings';
import ThemeSettings from './components/ThemeSettings';
import LanguageSettings from './components/LanguageSettings';
import Wallet from './components/Wallet';
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
  const [activeMenu, setActiveMenu] = useState('quote'); // 'quote', 'thought', 'theme', 'language', 'notification', 'data', 'wallet'
  const [thought, setThought] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [thoughts, setThoughts] = useState([]);
  const [quote, setQuote] = useState(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return dailyQuotes[dayOfYear % dailyQuotes.length];
  });

  const moods = {
    happy: '😊',
    sad: '😢',
    excited: '🤗',
    angry: '😠',
    neutral: '😐'
  };

  useEffect(() => {
    console.log("Auth state change effect running");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setSavedThoughts([]);
      }
      setIsLoading(false);
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
      console.log('Loading thoughts for user:', userId);
      
      const thoughtsRef = collection(db, 'thoughts');
      const thoughtsQuery = query(
        thoughtsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const thoughtsSnapshot = await getDocs(thoughtsQuery);
      const thoughts = thoughtsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Loaded thoughts:', thoughts);
      setSavedThoughts(thoughts);

      const bookmarksRef = doc(db, 'bookmarks', userId);
      const bookmarksDoc = await getDoc(bookmarksRef);
      if (bookmarksDoc.exists()) {
        setBookmarks(bookmarksDoc.data().bookmarks || []);
      }
    } catch (error) {
      console.error('Error loading thoughts:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true); // 로딩 상태 시작
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log('로그인 성공:', result.user.email);
        
        // Firestore에 사용자 정보 저장
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        
        // 사용자 데이터 로드
        await loadUserData(result.user.uid);
        
        // 로컬 스토리지에 로그인 상태 저장
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', result.user.uid);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
          break;
        case 'auth/popup-blocked':
          errorMessage = '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = '이전 로그인 요청이 진행 중입니다. 잠시 후 다시 시도해주세요.';
          break;
        case 'auth/network-request-failed':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        default:
          errorMessage = `로그인 오류: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false); // 로딩 상태 종료
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

  const handleThoughtSubmit = async (e) => {
    e.preventDefault();
    if (!thought.trim() || !user) {
      console.log('No thought or user:', { thought: thought.trim(), userId: user?.uid });
      return;
    }

    try {
      console.log('Saving thought:', {
        userId: user.uid,
        thought: thought.trim(),
        quote: quote
      });

      const newThought = {
        text: thought.trim(),
        date: new Date().toISOString(),
        userId: user.uid,
        quote: {
          text: quote.text,
          author: quote.author
        }
      };
      
      // Firestore에 저장
      const thoughtsRef = collection(db, 'thoughts');
      const docRef = await addDoc(thoughtsRef, newThought);
      
      console.log('Thought saved successfully:', docRef.id);
      
      // 상태 업데이트
      setSavedThoughts(prevThoughts => [{
        id: docRef.id,
        ...newThought
      }, ...prevThoughts]);
      
      // 입력 필드 초기화
      setThought('');
      
      // 성공 메시지 표시
      alert('생각이 저장되었습니다!');
    } catch (error) {
      console.error('Error saving thought:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
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
            <h2>오늘의 명언</h2>
            <div className="quote-content">
              <p>"{quote.text}"</p>
              <p className="quote-author">- {quote.author}</p>
            </div>
            <ShareButton quote={quote} thought={thought} />
            
            <div className="thought-input-section">
              <h3>나의 생각</h3>
              <form onSubmit={handleThoughtSubmit}>
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="이 명언에 대한 나의 생각을 적어보세요..."
                />
                <button type="submit">저장하기</button>
              </form>
            </div>

            {user && (
              <div className="saved-thoughts-section">
                <h3>저장된 생각들</h3>
                {savedThoughts.length > 0 ? (
                  <div className="thoughts-list">
                    {savedThoughts.map((savedThought) => (
                      <div key={savedThought.id} className="thought-item">
                        <div className="thought-date">
                          {new Date(savedThought.date).toLocaleDateString()}
                        </div>
                        <div className="thought-quote">
                          "{savedThought.quote.text}"
                        </div>
                        <div className="thought-text">
                          {savedThought.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-thoughts">아직 저장된 생각이 없습니다.</p>
                )}
              </div>
            )}
          </div>
        );
      case 'wallet':
        return <Wallet user={user} />;
      case 'theme':
        return <ThemeSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'notification':
        return <NotificationSettings />;
      case 'data':
        return <DataManagement user={user} savedThoughts={savedThoughts} setSavedThoughts={setSavedThoughts} bookmarks={bookmarks} setBookmarks={setBookmarks} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">로딩중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <h2>Daily Thought</h2>
        <p>매일 새로운 명언과 함께 나의 생각을 기록해보세요</p>
        <button onClick={handleLogin} className="login-button">
          Google로 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>Daily Thought</h1>
        <div className="auth-buttons">
          {user ? (
            <div className="user-info">
              {user.photoURL && (
                <img src={user.photoURL} alt="프로필" className="profile-image" />
              )}
              <span className="user-name">{user.displayName}</span>
              <button onClick={handleLogout} className="logout-button">
                로그아웃
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="login-button">
              로그인
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
                오늘의 명언
              </button>
              <button
                className={`menu-button ${activeMenu === 'wallet' ? 'active' : ''}`}
                onClick={() => setActiveMenu('wallet')}
              >
                내 지갑
              </button>
              <button
                className={`menu-button ${activeMenu === 'theme' ? 'active' : ''}`}
                onClick={() => setActiveMenu('theme')}
              >
                테마 설정
              </button>
              <button
                className={`menu-button ${activeMenu === 'language' ? 'active' : ''}`}
                onClick={() => setActiveMenu('language')}
              >
                언어 설정
              </button>
              <button
                className={`menu-button ${activeMenu === 'notification' ? 'active' : ''}`}
                onClick={() => setActiveMenu('notification')}
              >
                알림 설정
              </button>
              <button
                className={`menu-button ${activeMenu === 'data' ? 'active' : ''}`}
                onClick={() => setActiveMenu('data')}
              >
                데이터 관리
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