import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWAFLA7k2qSTRfqzYBLwpDtjzt68j08_M",
  authDomain: "daily-quotes-app-9bf66.firebaseapp.com",
  projectId: "daily-quotes-app-9bf66",
  storageBucket: "daily-quotes-app-9bf66.appspot.com",
  messagingSenderId: "287571952965",
  appId: "1:287571952965:web:b6801a07c2869e10792a2c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 