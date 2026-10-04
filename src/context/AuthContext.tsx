import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access temporarily disabled. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/missing-password':
      return 'Please provide a password.';
    default:
      return 'Authentication failed. Please check your credentials.';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Researcher'
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const register = async (email: string, password: string, name?: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      if (name && name.trim()) {
        try {
          await updateProfile(fbUser, { displayName: name.trim() });
        } catch (profileErr) {
          console.warn('Profile name update notice:', profileErr);
        }
      }

      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: name?.trim() || fbUser.displayName || fbUser.email?.split('@')[0] || 'Researcher'
      };

      setUser(authUser);
      setFirebaseUser(fbUser);
      return { success: true, user: authUser };
    } catch (err: any) {
      const message = formatAuthError(err?.code || '');
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Researcher'
      };

      setUser(authUser);
      setFirebaseUser(fbUser);
      return { success: true, user: authUser };
    } catch (err: any) {
      const message = formatAuthError(err?.code || '');
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        loading,
        error,
        clearError,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
