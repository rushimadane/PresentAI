import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env as Record<string, string | undefined>;

// Prefer values from a root .env (VITE_FIREBASE_*). The hardcoded fallbacks
// point at the original project, whose API key is currently SUSPENDED — create a
// new Firebase project and set the VITE_FIREBASE_* env vars to switch to it.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAPPaeVmLMapO_BWG8A9YXYTfW6SY8ep1A",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "presentai-123c5.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "presentai-123c5",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "presentai-123c5.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "353047834015",
  appId: env.VITE_FIREBASE_APP_ID || "1:353047834015:web:75430a6c83fce1da23a1aa",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-BGJJ7YC8X3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
