import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBVwFvYEWEXkk1ZxXWEVB6wZDzGk_Tz0Ug",
  authDomain: "dailythought-c8a5c.firebaseapp.com",
  projectId: "dailythought-c8a5c",
  storageBucket: "dailythought-c8a5c.appspot.com",
  messagingSenderId: "1098498831961",
  appId: "1:1098498831961:web:e2c0c0a5a2c0a5a2c0a5a2"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스
const db = getFirestore(app);

// Auth 인스턴스 초기화 및 설정
const auth = getAuth(app);
auth.useDeviceLanguage(); // 사용자 브라우저 언어 설정 사용

export { app, db, auth }; 