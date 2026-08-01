import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// ✅ Register New User
export const registerUser = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  console.log("User created:", user.uid);

  // Update name in Firebase Auth
  await updateProfile(user, {
    displayName: fullName,
  });

  // Best-effort: save user info in Firestore. Don't fail registration if
  // Firestore isn't set up yet or security rules block the write — the auth
  // account already exists at this point.
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      fullName,
      createdAt: new Date(),
    });
  } catch (firestoreErr) {
    console.warn("Could not write user profile to Firestore:", firestoreErr);
  }

  return user;
};

// ✅ Login Existing User
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
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