import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDWAFLA7k2qSTRfqzYBLwpDtjzt68j08_M",
  authDomain: "daily-quotes-app-9bf66.firebaseapp.com",
  projectId: "daily-quotes-app-9bf66",
  storageBucket: "daily-quotes-app-9bf66.appspot.com",
  messagingSenderId: "287571952965",
  appId: "1:287571952965:web:b6801a07c2869e10792a2c",
  measurementId: "G-9SLLSGH4VJ"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 초기화
const db = getFirestore(app);

// Auth 인스턴스 초기화
const auth = getAuth(app);

// 인증 상태 변경 감지 및 디버깅
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('No user is signed in.');
  }
});

export { app, db, auth }; 