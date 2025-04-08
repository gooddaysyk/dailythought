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

class AppContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todayQuote: null,
      userThought: '',
      savedThoughts: [],
      selectedCategory: 'all',
      bookmarks: [],
      showBookmarks: false,
      selectedDate: new Date(),
      selectedMood: 'neutral',
      user: null,
      isLoading: true,
      activeMenu: 'quote',
      thought: '',
      searchQuery: '',
      thoughts: [],
      quote: (() => {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return dailyQuotes[dayOfYear % dailyQuotes.length];
      })(),
      isOnline: navigator.onLine,
      isUsingCache: false
    };

    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);

    this.moods = {
      happy: '😊',
      sad: '😢',
      excited: '🤗',
      angry: '😠',
      neutral: '😐'
    };

    this.authUnsubscribe = null;
  }

  componentDidMount() {
    // 로그인 상태 확인
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      this.setState({ isLoading: true });
    }

    // 네트워크 상태 초기 체크 및 모니터링
    const checkOnlineStatus = () => {
      const isOnline = navigator.onLine;
      console.log('현재 네트워크 상태:', isOnline ? '온라인' : '오프라인');
      this.setState({ isOnline });
    };

    // 초기 상태 체크
    checkOnlineStatus();

    // 이벤트 리스너 등록
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    this.authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed:", user?.uid);
      this.setState({ user });
      if (user) {
        await this.loadUserData(user.uid);
      } else {
        this.setState({ savedThoughts: [] });
      }
      this.setState({ isLoading: false });
    });

    this.fetchTodayQuote();
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  handleOnline = () => {
    console.log('온라인 상태로 전환되었습니다.');
    this.setState({ isOnline: true, isUsingCache: false });
    
    if (this.state.user && this.state.isUsingCache) {
      console.log('캐시된 데이터 동기화 시작');
      this.loadUserData(this.state.user.uid);
    }
  };

  handleOffline = () => {
    console.log('오프라인 상태로 전환되었습니다.');
    this.setState({ isOnline: false });
  };

  fetchTodayQuote = async () => {
    try {
      const today = new Date().toLocaleDateString();
      const savedQuote = localStorage.getItem(`quote_${today}`);
      
      if (savedQuote) {
        this.setState({ todayQuote: JSON.parse(savedQuote) });
      } else {
        const newQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
        this.setState({ todayQuote: newQuote });
        localStorage.setItem(`quote_${today}`, JSON.stringify(newQuote));
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleThoughtSubmit = async (e) => {
    e.preventDefault();
    
    if (!this.state.thought.trim()) {
      alert('생각을 입력해주세요.');
      return;
    }

    if (!this.state.user) {
      alert('로그인이 필요합니다.');
      return;
    }

    this.setState({ isLoading: true });

    try {
      const thoughtData = {
        text: this.state.thought,
        quote: this.state.quote,
        date: new Date().toISOString(),
        userId: this.state.user.uid,
        mood: this.state.selectedMood,
        createdAt: new Date().getTime()
      };

      console.log('Saving thought:', thoughtData);

      // 로컬 저장 먼저 수행
      const newThought = {
        id: `local_${Date.now()}`,
        ...thoughtData,
        pendingSync: true
      };

      // 로컬 상태 업데이트
      this.setState(prevState => ({
        savedThoughts: [newThought, ...prevState.savedThoughts],
        thought: ''
      }));

      // 로컬 캐시 업데이트
      const cachedThoughts = JSON.parse(localStorage.getItem(`thoughts_${this.state.user.uid}`) || '[]');
      cachedThoughts.unshift(newThought);
      localStorage.setItem(`thoughts_${this.state.user.uid}`, JSON.stringify(cachedThoughts));

      // Firestore에 저장
      try {
        const thoughtsRef = collection(db, 'thoughts');
        console.log('Saving to Firestore...');
        const docRef = await addDoc(thoughtsRef, thoughtData);
        console.log('Saved to Firestore, docRef:', docRef.id);

        // 성공적으로 저장되면 로컬 데이터 업데이트
        const serverThought = {
          id: docRef.id,
          ...thoughtData,
          pendingSync: false
        };

        // 로컬 상태 업데이트
        this.setState(prevState => ({
          savedThoughts: prevState.savedThoughts.map(t => 
            t.id === newThought.id ? serverThought : t
          )
        }));

        // 캐시 업데이트
        const updatedCachedThoughts = JSON.parse(localStorage.getItem(`thoughts_${this.state.user.uid}`) || '[]');
        const updatedThoughts = updatedCachedThoughts.map(t => 
          t.id === newThought.id ? serverThought : t
        );
        localStorage.setItem(`thoughts_${this.state.user.uid}`, JSON.stringify(updatedThoughts));

      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // Firestore 저장 실패시에도 로컬 데이터는 유지
        alert('서버 저장에 실패했습니다. 나중에 다시 동기화됩니다.');
      }

    } catch (error) {
      console.error('Error in handleThoughtSubmit:', error);
      alert('생각 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  loadUserData = async (userId) => {
    try {
      console.log('Loading thoughts for user:', userId);
      
      // 캐시된 데이터 먼저 로드
      const cachedData = localStorage.getItem(`thoughts_${userId}`);
      if (cachedData) {
        const thoughts = JSON.parse(cachedData);
        this.setState({ savedThoughts: thoughts });
      }

      // 오프라인 상태 확인
      if (!navigator.onLine) {
        console.log('오프라인 상태 - 캐시된 데이터만 사용');
        this.setState({ isUsingCache: true });
        return;
      }

      // 온라인 상태에서 서버 데이터 로드
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
      
      console.log('서버에서 데이터 로드됨:', thoughts.length);
      this.setState({ 
        savedThoughts: thoughts,
        isUsingCache: false 
      });

      // 캐시 업데이트
      localStorage.setItem(`thoughts_${userId}`, JSON.stringify(thoughts));
      localStorage.setItem(`thoughts_timestamp_${userId}`, Date.now().toString());

    } catch (error) {
      console.error('Error in loadUserData:', error);
      if (!navigator.onLine) {
        console.log('오프라인 상태 - 캐시된 데이터 사용');
        this.setState({ isUsingCache: true });
      } else {
        throw error;
      }
    }
  };

  handleLogin = async () => {
    try {
      if (!navigator.onLine) {
        alert('오프라인 상태에서는 로그인할 수 없습니다. 인터넷 연결을 확인해주세요.');
        return;
      }

      this.setState({ isLoading: true });
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log('로그인 성공:', result.user.email);
        
        try {
          const userRef = doc(db, 'users', result.user.uid);
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            lastLogin: new Date().toISOString()
          }, { merge: true });
          
          await this.loadUserData(result.user.uid);
          
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', result.user.uid);
          localStorage.setItem('userEmail', result.user.email);
          localStorage.setItem('userDisplayName', result.user.displayName);
        } catch (error) {
          console.error('Error saving user data:', error);
          if (!navigator.onLine) {
            console.log('오프라인 상태입니다. 일부 데이터는 동기화되지 않을 수 있습니다.');
          } else {
            throw error;
          }
        }
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
      this.setState({ isLoading: false });
    }
  };

  handleLogout = async () => {
    try {
      await signOut(auth);
      this.setState({
        savedThoughts: [],
        bookmarks: []
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  render() {
    const { isLoading, user, isOnline, isUsingCache, activeMenu } = this.state;

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
          <button onClick={this.handleLogin} className="login-button">
            Google로 시작하기
          </button>
        </div>
      );
    }

    const renderContent = () => {
      switch (activeMenu) {
        case 'quote':
          return (
            <div className="quote-section">
              <h2>오늘의 명언</h2>
              <div className="quote-content">
                <p>"{this.state.quote.text}"</p>
                <p className="quote-author">- {this.state.quote.author}</p>
              </div>
              <ShareButton quote={this.state.quote} thought={this.state.thought} />
              
              <div className="thought-input-section">
                <h3>나의 생각</h3>
                <form onSubmit={this.handleThoughtSubmit}>
                  <textarea
                    value={this.state.thought}
                    onChange={(e) => this.setState({ thought: e.target.value })}
                    placeholder="이 명언에 대한 나의 생각을 적어보세요..."
                  />
                  <button type="submit">저장하기</button>
                </form>
              </div>

              <div className="saved-thoughts-section">
                <h3>저장된 생각들</h3>
                {this.state.savedThoughts.length > 0 ? (
                  <div className="thoughts-list">
                    {this.state.savedThoughts.map((savedThought) => (
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
          return <DataManagement 
            user={user} 
            savedThoughts={this.state.savedThoughts} 
            setSavedThoughts={(thoughts) => this.setState({ savedThoughts: thoughts })}
            bookmarks={this.state.bookmarks}
            setBookmarks={(bookmarks) => this.setState({ bookmarks })}
          />;
        default:
          return null;
      }
    };

    return (
      <div className="container">
        <header className="app-header">
          <h1>Daily Thought</h1>
          {!isOnline && (
            <div className="offline-banner">
              오프라인 모드 - 일부 기능이 제한될 수 있습니다
              {isUsingCache && (
                <div className="cache-notice">
                  캐시된 데이터를 사용 중입니다. 최신 데이터와 차이가 있을 수 있습니다.
                </div>
              )}
            </div>
          )}
          <div className="auth-buttons">
            {user ? (
              <div className="user-info">
                {user.photoURL && (
                  <img src={user.photoURL} alt="프로필" className="profile-image" />
                )}
                <span className="user-name">{user.displayName}</span>
                <button onClick={this.handleLogout} className="logout-button">
                  로그아웃
                </button>
              </div>
            ) : (
              <button onClick={this.handleLogin} className="login-button">
                로그인
              </button>
            )}
          </div>
        </header>

        <main className="app-main">
          <div className="content-wrapper">
            <nav className="side-menu">
              <button
                className={`menu-button ${activeMenu === 'quote' ? 'active' : ''}`}
                onClick={() => this.setState({ activeMenu: 'quote' })}
              >
                오늘의 명언
              </button>
              <button
                className={`menu-button ${activeMenu === 'wallet' ? 'active' : ''}`}
                onClick={() => this.setState({ activeMenu: 'wallet' })}
              >
                내 지갑
              </button>
              <button
                className={`menu-button ${activeMenu === 'theme' ? 'active' : ''}`}
                onClick={() => this.setState({ activeMenu: 'theme' })}
              >
                테마 설정
              </button>
              <button
                className={`menu-button ${activeMenu === 'language' ? 'active' : ''}`}
                onClick={() => this.setState({ activeMenu: 'language' })}
              >
                언어 설정
              </button>
              <button
                className={`menu-button ${activeMenu === 'notification' ? 'active' : ''}`}
                onClick={() => this.setState({ activeMenu: 'notification' })}
              >
                알림 설정
              </button>
              <button
                className={`menu-button ${activeMenu === 'data' ? 'active' : ''}`}
                onClick={() => this.setState({ activeMenu: 'data' })}
              >
                데이터 관리
              </button>
            </nav>

            <main className="content">
              {renderContent()}
            </main>
          </div>
        </main>
      </div>
    );
  }
}

export default AppContent; 