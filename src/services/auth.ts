import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase";


import { doc, setDoc } from "firebase/firestore";

console.log("Firebase Auth:", auth);


// ✅ Register New User
export const registerUser = async (email: string, password: string, fullName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    console.log("User created:", user.uid);
  
    // Update name in Firebase Auth
    await updateProfile(user, {
      displayName: fullName,
    });
  
    // Optional: Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      fullName,
      createdAt: new Date(),
    });
  
    return user;
  };

// ✅ Login Existing User
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw error.message;
  }
};

// ✅ Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw error.message;
  }
};
export const getCurrentUser = (callback: (user: User | null) => void) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  
    return unsubscribe; // You can call this to stop listening
  };