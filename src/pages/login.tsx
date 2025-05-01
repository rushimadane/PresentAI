import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";

// Define the Login component
const Login: React.FC = () => {
  // State for email and password
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Navigation hook
  const navigate = useNavigate();

  // Auth context
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await loginUser(email, password); // Auth with Firebase
      login(); // Set global login state
      toast.success("Logged in!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 bg-background overflow-hidden">
      {/* 🌄 BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-pattern.jpg"
          alt="background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-purple-100/30 to-blue-100/30 mix-blend-lighten" />
      </div>

      {/* 🫧 FLOATING BLOBS */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-60 animate-float" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-60 animate-float delay-200" />

      {/* 🔐 LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10"
      >
        <h2 className="text-4xl font-bold text-center mb-2 leading-tight text-gray-900">
          Welcome Back <span className="inline-block animate-wiggle">👋</span>
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Login to access your smart presenter workspace
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </div>
          <Button
            type="submit"
            className="w-full text-lg bg-primary hover:bg-primary/90"
          >
            Sign In
          </Button>
        </form>

        {/* Forgot Password */}
        <div className="text-sm text-center mt-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <div className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;