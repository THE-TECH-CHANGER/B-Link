import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your actual Firebase Web Config
// 1. Go to Firebase Console -> Project Settings -> General
// 2. Scroll down to "Your apps", select the Web app `</>`, and copy the firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyCQCgMQWBtINsUWHOmkvzcgjWOvr9wgFxQ",
  authDomain: "bloodlink-1166a.firebaseapp.com",
  projectId: "bloodlink-1166a",
  storageBucket: "bloodlink-1166a.firebasestorage.app",
  messagingSenderId: "715658775952",
  appId: "1:715658775952:web:bfba7f2124fa0506567715"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
