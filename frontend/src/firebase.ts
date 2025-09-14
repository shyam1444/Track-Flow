import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBh90bIva_M7DxBJ9jVOpuMl637WoAsZIQ",
  authDomain: "assignment3-2865c.firebaseapp.com",
  projectId: "assignment3-2865c",
  storageBucket: "assignment3-2865c.firebasestorage.app",
  messagingSenderId: "652491302910",
  appId: "1:652491302910:web:74e56e54d90b6dae5742af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
