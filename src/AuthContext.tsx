// src/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  isLoggedIn: boolean;
  authReady: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Seed from localStorage to avoid a redirect flicker before Firebase resolves.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => localStorage.getItem("isLoggedIn") === "true"
  );
  // authReady lets route guards wait for Firebase to report the real state.
  const [authReady, setAuthReady] = useState<boolean>(false);

  // Firebase is the source of truth for auth state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        localStorage.setItem("isLoggedIn", "true");
      } else {
        localStorage.removeItem("isLoggedIn");
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Kept for call sites (login page). Firebase sign-in already happened;
  // this optimistically reflects it until onAuthStateChanged confirms.
  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    signOut(auth).catch((err) => console.warn("Sign-out error:", err));
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
