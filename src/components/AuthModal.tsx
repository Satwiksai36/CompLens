"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { signInAction, signUpAction } from "../actions/auth.actions";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { id: string; email: string; name: string | null; role: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === "signin") {
        const res = await signInAction({ email, password });
        if (res.success && res.user) {
          if (onSuccess) {
            onSuccess(res.user);
          } else {
            window.location.reload();
          }
          onClose();
        } else {
          setError(res.error || "Failed to sign in.");
        }
      } else {
        const res = await signUpAction({ email, password, name });
        if (res.success && res.user) {
          if (onSuccess) {
            onSuccess(res.user);
          } else {
            window.location.reload();
          }
          onClose();
        } else {
          setError(res.error || "Failed to sign up.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-[#121214] rounded-2xl shadow-2xl animate-fadeIn z-10 border border-slate-200 dark:border-[#222226] overflow-hidden">
        
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        <div className="p-7">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Branding */}
          <div className="text-center mb-7">
            {/* Branding — matches Header logo */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/25 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="11" width="3" height="6" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="6" y="7" width="3" height="10" rx="1" fill="white" fillOpacity="0.85"/>
                <rect x="11" y="4" width="3" height="13" rx="1" fill="white"/>
                <path d="M2.5 10.5L7.5 6.5L12.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"/>
                <circle cx="14.5" cy="3" r="1.5" fill="#a5b4fc"/>
              </svg>
            </div>
            <div className="flex items-baseline gap-0">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Comp</span>
              <span className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 leading-none">Lens</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {activeTab === "signin"
              ? "Welcome back! Sign in to access compensation intelligence."
              : "Join thousands of professionals sharing verified salary data."}
          </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl mb-6">
            <button
              onClick={() => handleTabChange("signin")}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === "signin"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange("signup")}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === "signup"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (sign up only) */}
            {activeTab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400" htmlFor="auth-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 pl-10 pr-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 pl-10 pr-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={activeTab === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 pl-10 pr-10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {activeTab === "signup" && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Must be at least 6 characters.</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
                </>
              ) : activeTab === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            {/* Switch tab link */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              {activeTab === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("signup")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
