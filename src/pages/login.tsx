import React, { useState } from "react";
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
      const code = err?.code || "";
      const raw = err?.message || String(err);
      let message = "Login failed. Please try again.";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        message = "Incorrect email or password.";
      } else if (code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (code === "auth/too-many-requests") {
        message = "Too many attempts. Try again later or reset your password.";
      } else if (raw.includes("CONSUMER_SUSPENDED") || raw.includes("suspended")) {
        message = "The Firebase API key is suspended. A new Firebase project/key is needed.";
      } else if (code === "auth/network-request-failed") {
        message = "Network error. Check your connection and try again.";
      }
      toast.error(message);
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
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-border rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-center mb-1 text-gray-900">
          Log in
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Welcome back.
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
            className="text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="text-sm text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </section>
  );
};

export default Login;