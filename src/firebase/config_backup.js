// Firebase configuration for Blood Alert
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// TODO: Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyArJH2CV_Llg8jEYy3s1ruhSzyuLbNOjuk",
  authDomain: "blood-alert-4912.firebaseapp.com",
  projectId: "blood-alert-4912",
  storageBucket: "blood-alert-4912.firebasestorage.app",
  messagingSenderId: "1057362162762",
  appId: "1:1057362162762:web:246cb590201b1727a322b3",
  measurementId: "G-FNRHEMH4TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
