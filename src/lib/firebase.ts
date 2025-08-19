import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  OAuthProvider
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl3o2xyncdY1S6g-BTtGRjr95pHPvwn7w",
  authDomain: "zylo-prerelease.firebaseapp.com",
  projectId: "zylo-prerelease",
  storageBucket: "zylo-prerelease.firebasestorage.app",
  messagingSenderId: "786636315441",
  appId: "1:786636315441:web:4e4cfaf9a1d44c8e4bae10",
  measurementId: "G-D13BN9J1YH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in production)
if (import.meta.env.PROD) {
  getAnalytics(app);
}
export default app;