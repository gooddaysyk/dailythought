import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 인스턴스 초기화 및 설정
const auth = getAuth(app);
auth.useDeviceLanguage(); // 사용자 브라우저 언어 설정 사용

// Firestore 인스턴스
const db = getFirestore(app);

export { app, auth, db }; 