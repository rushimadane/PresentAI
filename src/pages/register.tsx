import React, { useState } from "react";
import { motion } from "framer-motion";
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
      console.error("Registration error:", err.message);

      let message = "Registration failed.";
      if (err.message.includes("email-already-in-use")) {
        message = "Email already in use.";
      } else if (err.message.includes("weak-password")) {
        message = "Password is too weak.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
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

      {/* 📝 REGISTER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10"
      >
        <h2 className="text-4xl font-bold text-center mb-2 leading-tight text-gray-900">
          Join Us <span className="inline-block animate-wiggle">🎉</span>
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Register to start your smart presenter journey
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
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </div>

        {success && (
          <div className="mt-4 text-green-600 text-center font-medium">
            🎉 Registration successful! Redirecting...
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Register;
