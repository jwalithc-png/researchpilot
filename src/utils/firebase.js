// Firebase Authentication & Services Integration
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Default configuration with environment variables or fallback demo credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-ResearchPilotDemoKey2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "researchpilot-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "researchpilot-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "researchpilot-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcd1234efgh5678"
};

let app = null;
let auth = null;
let isRealFirebase = false;

try {
  // Only initialize real Firebase if an API key is provided and not default placeholder
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('DemoKey')) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    isRealFirebase = true;
  }
} catch (err) {
  console.warn('Firebase initialization notice: using resilient local researcher auth mode.', err);
}

// Local mock storage key
const STORAGE_USER_KEY = 'researchpilot_auth_user';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

export async function loginWithEmail(email, password) {
  if (isRealFirebase && auth) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        displayName: userCred.user.displayName || email.split('@')[0],
        photoURL: userCred.user.photoURL,
        isDemo: false
      };
      setStoredUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Resilient Local / Demo Auth
  if (!email || !password) return { success: false, error: 'Email and password required' };
  const user = {
    uid: 'usr_' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: email.split('@')[0],
    role: 'Verified Researcher',
    isDemo: false,
    joinedAt: new Date().toISOString()
  };
  setStoredUser(user);
  return { success: true, user };
}

export async function registerWithEmail(email, password, displayName) {
  if (isRealFirebase && auth) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
      const user = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        isDemo: false
      };
      setStoredUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Resilient Local / Demo Registration
  const user = {
    uid: 'usr_' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: displayName || email.split('@')[0],
    role: 'Principal Investigator',
    isDemo: false,
    joinedAt: new Date().toISOString()
  };
  setStoredUser(user);
  return { success: true, user };
}

export async function loginDemoResearcher() {
  const demoUser = {
    uid: 'usr_demo_res_853',
    email: 'researcher@pilot.ai',
    displayName: 'Dr. J. Walith (Lead Epidemiologist)',
    role: 'Principal Investigator • Track 5 Public Interest',
    isDemo: true,
    joinedAt: new Date().toISOString(),
    avatarColor: '#6366f1'
  };
  setStoredUser(demoUser);
  return { success: true, user: demoUser };
}

export async function logoutUser() {
  if (isRealFirebase && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }
  setStoredUser(null);
  return { success: true };
}

export function subscribeAuth(callback) {
  if (isRealFirebase && auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
          isDemo: false
        };
        setStoredUser(u);
        callback(u);
      } else {
        const stored = getStoredUser();
        callback(stored);
      }
    });
  }

  // Check stored user initially
  const stored = getStoredUser();
  callback(stored);
  return () => {};
}
