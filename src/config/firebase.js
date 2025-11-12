import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAI, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase AI Logic with Google AI Backend (Gemini Developer API)
// Note: Utilise Gemini Developer API sans besoin de clé API séparée
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Initialize services
let analytics = null;
let analyticsReady = false;

const initAnalytics = async () => {
  const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

  if (analyticsEnabled && await isSupported()) {
    analytics = getAnalytics(app);
    analyticsReady = true;
    console.log('Firebase Analytics initialized for Quiz');
  } else {
    console.log('Firebase Analytics disabled or not supported');
  }
};

initAnalytics();

// Auth (for V2)
const auth = getAuth(app);

// Firestore (for V2)
const firestore = getFirestore(app);

export { app, ai, analytics, auth, firestore };
export const isAnalyticsReady = () => analyticsReady;
