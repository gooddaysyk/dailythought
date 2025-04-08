import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// GitHub Pages 도메인 설정
const isGitHubPages = window.location.hostname === "gooddaysyk.github.io";

const firebaseConfig = {
  apiKey: "AIzaSyDWAFLA7k2qSTRfqzYBLwpDtjzt68j08_M",
  authDomain: "daily-quotes-app-9bf66.firebaseapp.com",
  projectId: "daily-quotes-app-9bf66",
  storageBucket: "daily-quotes-app-9bf66.appspot.com",
  messagingSenderId: "287571952965",
  appId: "1:287571952965:web:b6801a07c2869e10792a2c",
  measurementId: "G-9SLLSGH4VJ"
};

// Firebase 초기화 전에 설정 확인
console.log('Current hostname:', window.location.hostname);
console.log('Using Firebase config:', firebaseConfig);

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 초기화
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Auth 인스턴스
const auth = getAuth(app);

// 인증 상태 변경 감지 및 디버깅
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
    console.log('User email:', user.email);
    console.log('Auth domain:', auth.config.authDomain);
  } else {
    console.log('No user is signed in.');
    console.log('Current auth config:', auth.config);
  }
});

// IndexedDB 지속성 활성화 (오프라인 지원)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('다중 탭이 열려 있어 오프라인 지속성을 활성화할 수 없습니다.');
    } else if (err.code === 'unimplemented') {
      console.warn('현재 브라우저는 오프라인 지속성을 지원하지 않습니다.');
    }
  });
}

export { app, db, auth }; 