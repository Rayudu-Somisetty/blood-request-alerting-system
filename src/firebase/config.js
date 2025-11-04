// Firebase configuration for Blood Alert
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Configuration is loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyArJH2CV_Llg8jEYy3s1ruhSzyuLbNOjuk",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blood-alert-4912.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blood-alert-4912",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blood-alert-4912.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1057362162762",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1057362162762:web:246cb590201b1727a322b3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-FNRHEMH4TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
