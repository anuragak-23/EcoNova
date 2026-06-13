// ============================================================
// AUTH.JS — Authentication Controller & Firebase Wrapper
// Carbon Footprint Awareness Platform — EcoNova
// ============================================================

import { FIREBASE_CONFIG } from './firebase-config.js';
import { getProfile, saveProfile } from './storage.js';

let firebaseAuth = null;
let isFirebaseEnabled = false;
let currentUser = null;
let authStateListeners = [];

// Check if valid Firebase credentials are provided
const isConfigValid = 
  FIREBASE_CONFIG.apiKey && 
  FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" && 
  FIREBASE_CONFIG.projectId && 
  FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID";

// Mock User Database in LocalStorage
const MOCK_USERS_KEY = 'econova_mock_users';
const SESSION_USER_KEY = 'econova_session_user';

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveMockUser(user) {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

// ── Auth Initialization ─────────────────────────────────────
export async function initAuth(onStateChanged) {
  if (onStateChanged) {
    authStateListeners.push(onStateChanged);
  }

  if (isConfigValid) {
    try {
      console.log('EcoNova: Initializing Firebase Authentication...');
      // Dynamically import Firebase v10 SDK
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { 
        getAuth, 
        onAuthStateChanged,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        signOut,
        GoogleAuthProvider,
        signInWithPopup,
        sendPasswordResetEmail,
        updateProfile
      } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

      const app = initializeApp(FIREBASE_CONFIG);
      firebaseAuth = getAuth(app);
      isFirebaseEnabled = true;

      // Bind methods
      window.firebaseSignIn = (email, password) => signInWithEmailAndPassword(firebaseAuth, email, password);
      window.firebaseSignUp = (email, password) => createUserWithEmailAndPassword(firebaseAuth, email, password);
      window.firebaseSignOut = () => signOut(firebaseAuth);
      window.firebaseGoogleSignIn = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(firebaseAuth, provider);
      };
      window.firebaseResetPassword = (email) => sendPasswordResetEmail(firebaseAuth, email);
      window.firebaseUpdateProfile = (user, updates) => updateProfile(user, updates);

      // Listen for auth state changes
      onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          currentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAnonymous: false,
            isGoogle: firebaseUser.providerData?.some(p => p.providerId === 'google.com') || false
          };
          
          // Sync profile to localStorage
          syncProfileFromUser(currentUser);
        } else {
          // Check if guest session exists
          const guestUser = loadGuestSession();
          if (guestUser) {
            currentUser = guestUser;
          } else {
            currentUser = null;
          }
        }
        notifyListeners();
      });
      return;
    } catch (e) {
      console.error('EcoNova: Firebase failed to load, falling back to Demo Auth Mode.', e);
    }
  }

  // Fallback / Demo Auth Mode
  console.log('EcoNova: Using Demo Auth Mode (Firebase config not set). Configure in js/firebase-config.js for live integration.');
  isFirebaseEnabled = false;

  // Load session from storage
  try {
    const sessionUser = localStorage.getItem(SESSION_USER_KEY);
    if (sessionUser) {
      currentUser = JSON.parse(sessionUser);
    } else {
      currentUser = loadGuestSession();
    }
  } catch (e) {
    currentUser = null;
  }
  notifyListeners();
}

function notifyListeners() {
  authStateListeners.forEach(listener => {
    try {
      listener(currentUser);
    } catch (e) {
      console.error('Error triggering auth state listener:', e);
    }
  });
}

function loadGuestSession() {
  try {
    const isGuest = localStorage.getItem('econova_guest_mode') === 'true';
    if (isGuest) {
      return {
        uid: 'guest-session',
        email: 'guest@econova.ai',
        displayName: 'Guest Explorer',
        isAnonymous: true,
        isGoogle: false
      };
    }
  } catch (e) {}
  return null;
}

// Sync profile name and values when logging in
function syncProfileFromUser(user) {
  const profile = getProfile();
  if (user.displayName) {
    profile.name = user.displayName;
  }
  saveProfile(profile);
}

// ── Auth Actions ────────────────────────────────────────────

// 1. Email/Password Sign In
export async function signIn(email, password, rememberMe = true) {
  if (isFirebaseEnabled && firebaseAuth) {
    // Firebase Auth
    const userCredential = await window.firebaseSignIn(email, password);
    return userCredential.user;
  } else {
    // Simulated Auth
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getMockUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (found) {
          currentUser = {
            uid: found.uid,
            email: found.email,
            displayName: found.displayName,
            isAnonymous: false,
            isGoogle: false
          };
          if (rememberMe) {
            localStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
          }
          localStorage.removeItem('econova_guest_mode');
          syncProfileFromUser(currentUser);
          notifyListeners();
          resolve(currentUser);
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 800);
    });
  }
}

// 2. Email/Password Sign Up
export async function signUp(email, password, fullName, country = 'IN') {
  if (isFirebaseEnabled && firebaseAuth) {
    // Firebase Auth signup
    const userCredential = await window.firebaseSignUp(email, password);
    await window.firebaseUpdateProfile(userCredential.user, {
      displayName: fullName
    });
    
    currentUser = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: fullName,
      isAnonymous: false,
      isGoogle: false
    };
    
    // Create new profile state
    initializeProfile(fullName, country);
    notifyListeners();
    return currentUser;
  } else {
    // Simulated Auth signup
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getMockUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          reject(new Error('An account with this email already exists.'));
          return;
        }

        const newUser = {
          uid: 'sim-' + Math.random().toString(36).substring(2, 11),
          email,
          password,
          displayName: fullName,
          country
        };

        saveMockUser(newUser);

        currentUser = {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          isAnonymous: false,
          isGoogle: false
        };

        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
        localStorage.removeItem('econova_guest_mode');
        
        // Setup initial storage profile
        initializeProfile(fullName, country);
        notifyListeners();
        resolve(currentUser);
      }, 1000);
    });
  }
}

// 3. Continue with Google
export async function signInWithGoogle() {
  if (isFirebaseEnabled && firebaseAuth) {
    const userCredential = await window.firebaseGoogleSignIn();
    return userCredential.user;
  } else {
    // Simulated Google Login Popup
    return new Promise((resolve) => {
      setTimeout(() => {
        currentUser = {
          uid: 'google-sim-' + Math.random().toString(36).substring(2, 11),
          email: 'eco.champion@gmail.com',
          displayName: 'Eco Champion',
          isAnonymous: false,
          isGoogle: true
        };
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
        localStorage.removeItem('econova_guest_mode');
        
        // Sync profile
        const profile = getProfile();
        // If it's a first time google user, trigger onboarding profile config
        if (!profile.createdAt || profile.name === 'Eco Warrior') {
          initializeProfile('Eco Champion', 'IN');
        } else {
          profile.name = 'Eco Champion';
          saveProfile(profile);
        }

        notifyListeners();
        resolve(currentUser);
      }, 1200);
    });
  }
}

// 4. Continue as Guest
export function signInAsGuest() {
  localStorage.setItem('econova_guest_mode', 'true');
  localStorage.removeItem(SESSION_USER_KEY);
  
  currentUser = {
    uid: 'guest-session',
    email: 'guest@econova.ai',
    displayName: 'Guest Explorer',
    isAnonymous: true,
    isGoogle: false
  };

  // Re-init profile to default guest values
  const profile = getProfile();
  profile.name = 'Guest Explorer';
  saveProfile(profile);

  notifyListeners();
  return currentUser;
}

// 5. Sign Out
export async function signOutUser() {
  localStorage.removeItem('econova_guest_mode');
  localStorage.removeItem(SESSION_USER_KEY);
  currentUser = null;

  if (isFirebaseEnabled && firebaseAuth) {
    await window.firebaseSignOut();
  } else {
    notifyListeners();
  }
}

// 6. Forgot Password
export async function resetPassword(email) {
  if (isFirebaseEnabled && firebaseAuth) {
    await window.firebaseResetPassword(email);
  } else {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getMockUsers();
        const found = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (found || email.includes('@')) {
          resolve();
        } else {
          reject(new Error('Email address not found.'));
        }
      }, 600);
    });
  }
}

// Helper to initialize local profile template
function initializeProfile(fullName, country) {
  const profile = getProfile();
  profile.name = fullName;
  profile.createdAt = new Date().toISOString();
  profile.settings = {
    ...profile.settings,
    country: country
  };
  saveProfile(profile);
}

export function getCurrentUser() {
  return currentUser;
}

export function getFirebaseEnabled() {
  return isFirebaseEnabled;
}
