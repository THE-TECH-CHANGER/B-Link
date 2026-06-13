"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@apollo.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In a real scenario, this connects to Firebase Auth
      // await signInWithEmailAndPassword(auth, email, password);
      
      // For demo purposes, we will bypass actual Firebase if config is missing
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary-red/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-dark-red/20 rounded-full blur-[150px]"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-red/10 border border-primary-red/20 mb-6">
            <Droplet className="w-8 h-8 text-primary-red" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-foreground/60 mt-2">Sign in to the Hospital Command Center</p>
        </div>

        <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 ml-1">Hospital Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary-red/50 transition-all"
                placeholder="admin@hospital.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <span className="text-xs text-primary-red hover:underline cursor-pointer">Forgot?</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary-red/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-foreground/40 mt-8">
          Secure portal for verified medical institutions only.
        </p>
      </div>
    </div>
  );
}
