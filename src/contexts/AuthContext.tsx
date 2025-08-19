import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  GoogleAuthProvider, 
  signInWithPopup, 
  User, 
  onAuthStateChanged,
  AuthError as FirebaseAuthError,
  AuthErrorCodes
} from 'firebase/auth';

type FirebaseError = FirebaseAuthError;

import { auth } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification
      await sendEmailVerification(userCredential.user);
      // User is automatically signed in after successful sign up
    } catch (error: any) {
      console.error('Error signing up:', error);
      let errorMessage = 'Failed to create an account. ';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage += 'Email is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Email address is not valid.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage += 'Email/Password authentication is not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage += 'Password is too weak. Please use a stronger password.';
          break;
        default:
          errorMessage += error.message || 'Please try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // Google Sign In
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // User is signed in automatically by Firebase
      // The onAuthStateChanged listener will update currentUser
      return;
      
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      let errorMessage = 'Failed to sign in with Google. ';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with the same email but different sign-in credentials.';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign in was cancelled.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'The sign-in popup was blocked. Please allow popups for this site.';
            break;
          case 'auth/unauthorized-domain':
            errorMessage = 'This domain is not authorized for Google Sign-In.';
            break;
          default:
            errorMessage = error.message || 'An unknown error occurred.';
        }
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}