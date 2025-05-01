import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAPPaeVmLMapO_BWG8A9YXYTfW6SY8ep1A",
    authDomain: "presentai-123c5.firebaseapp.com",
    projectId: "presentai-123c5",
    storageBucket: "presentai-123c5.appspot.com", // ✅ this is the correct one
    messagingSenderId: "353047834015",
    appId: "1:353047834015:web:75430a6c83fce1da23a1aa",
    measurementId: "G-BGJJ7YC8X3"
  };
  

console.log("Using Firebase config:", firebaseConfig); // ✅ Now it's safe

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
