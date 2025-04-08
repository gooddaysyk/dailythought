import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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

// Firestore 인스턴스 초기화 with 최적화 설정
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // WebSocket 대신 HTTP 롱폴링 사용
  useFetchStreams: false, // 스트리밍 비활성화
});

// Auth 인스턴스
const auth = getAuth(app);

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

// Analytics 초기화 (선택적)
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

export { app, db, auth, analytics }; 