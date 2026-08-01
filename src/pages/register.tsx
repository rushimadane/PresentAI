import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      console.log("Registering user...");
      await registerUser(email, password, fullName);
      console.log("Successfully registered ✅");

      setSuccess(true);
      toast.success("Successfully registered! 🎉");

      setTimeout(() => {
        console.log("Redirecting to /login");
        navigate("/login");
      }, 1000);
    } catch (err: any) {
      const code = err?.code || "";
      const raw = err?.message || String(err);
      console.error("Registration error:", code || raw);

      let message = "Registration failed. Please try again.";
      if (code === "auth/email-already-in-use") {
        message = "Email already in use.";
      } else if (code === "auth/weak-password") {
        message = "Password is too weak (use at least 6 characters).";
      } else if (code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (code === "auth/operation-not-allowed") {
        message = "Email/password sign-up is disabled in Firebase. Enable it in the Firebase console.";
      } else if (raw.includes("CONSUMER_SUSPENDED") || raw.includes("suspended")) {
        message = "The Firebase API key is suspended. See setup notes — a new Firebase project/key is needed.";
      } else if (code === "auth/network-request-failed") {
        message = "Network error. Check your connection and try again.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-border rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-center mb-1 text-gray-900">
          Create your account
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          It takes a few seconds.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full text-lg bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Registering...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
        </div>

        {success && (
          <div className="mt-4 text-green-600 text-center font-medium">
            Registration successful. Redirecting...
          </div>
        )}
      </div>
    </section>
  );
};

export default Register;
