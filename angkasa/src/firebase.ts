// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAF4veeyofGsuM9rRYA4MbMwksw1bVyzBM",
  authDomain: "project-sekolah-2ad32.firebaseapp.com",
  projectId: "project-sekolah-2ad32",
  storageBucket: "project-sekolah-2ad32.firebasestorage.app",
  messagingSenderId: "238726950843",
  appId: "1:238726950843:web:dcc46562e4aa756f535e9e",
  measurementId: "G-2WHX7LPDN4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);