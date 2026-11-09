"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStudioStore } from "@/stores/useStudioStore";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentView } = useStudioStore();
  const { loginWithEmail, signupWithEmail, loginWithGoogle, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === "signup") {
      if (!displayName.trim()) {
        setError("Please enter a producer display name.");
        setIsSubmitting(false);
        return;
      }
      const res = await signupWithEmail(email, password, displayName);
      if (res.success) {
        setIsAuthModalOpen(false);
        setCurrentView("dashboard");
      } else {
        setError(res.error || "Sign up failed.");
      }
    } else {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        setIsAuthModalOpen(false);
        setCurrentView("dashboard");
      } else {
        setError(res.error || "Sign in failed.");
      }
    }
    setIsSubmitting(false);
  };

  const handleGoogle = async () => {
    setError(null);
    const res = await loginWithGoogle();
    if (res.success) {
      setIsAuthModalOpen(false);
      setCurrentView("dashboard");
    } else if (res.error) {
      setError(res.error);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    setIsAuthModalOpen(false);
    setCurrentView("dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 p-4 select-none">
      <div className="bg-surface-1 border border-surface-border w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-brand shrink-0" />
            <h2 className="text-sm font-bold text-chalk uppercase tracking-wide">
              {mode === "signin" ? "Sign In to BandLab" : "Create BandLab Account"}
            </h2>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-sm hover:bg-surface-2 text-slateMuted hover:text-chalk transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 border-b border-surface-border text-xs font-mono">
          <button
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`py-2.5 text-center font-bold transition border-b-2 ${
              mode === "signin"
                ? "border-brand text-brand bg-surface-0/60"
                : "border-transparent text-slateMuted hover:text-chalk"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2.5 text-center font-bold transition border-b-2 ${
              mode === "signup"
                ? "border-brand text-brand bg-surface-0/60"
                : "border-transparent text-slateMuted hover:text-chalk"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 bg-surface-0 text-xs">
          {error && (
            <div className="p-3 bg-audio-rec/15 border border-audio-rec/40 rounded-sm flex items-start gap-2 text-white text-[11px] font-mono leading-tight">
              <AlertCircle className="w-4 h-4 shrink-0 text-audio-rec mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-[11px] font-mono text-steel block mb-1 uppercase">
                  Producer Name
                </label>
                <div className="flex items-center bg-surface-1 border border-surface-border rounded-sm px-2.5 py-1.5 focus-within:border-surface-strong">
                  <User className="w-4 h-4 text-slateMuted mr-2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Beatmaker"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent text-chalk focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-steel block mb-1 uppercase">
                Email Address
              </label>
              <div className="flex items-center bg-surface-1 border border-surface-border rounded-sm px-2.5 py-1.5 focus-within:border-surface-strong">
                <Mail className="w-4 h-4 text-slateMuted mr-2" />
                <input
                  type="email"
                  required
                  placeholder="producer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-chalk focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-steel block mb-1 uppercase">
                Password
              </label>
              <div className="flex items-center bg-surface-1 border border-surface-border rounded-sm px-2.5 py-1.5 focus-within:border-surface-strong">
                <Lock className="w-4 h-4 text-slateMuted mr-2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-chalk focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 font-mono font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Social / Alternative Divider */}
          <div className="flex items-center my-3 text-[10px] font-mono text-slateMuted uppercase">
            <div className="flex-1 border-t border-surface-border" />
            <span className="px-2">Or Continue With</span>
            <div className="flex-1 border-t border-surface-border" />
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-2 rounded-sm bg-surface-1 hover:bg-surface-2 border border-surface-border text-chalk font-mono text-xs transition flex items-center justify-center gap-2"
          >
            <span className="font-bold text-audio-cyan">G</span>
            <span>Google Account</span>
          </button>

          {/* Guest Access Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleGuest}
              className="text-[11px] font-mono text-slateMuted hover:text-brand transition underline"
            >
              Skip for now: Continue as Instant Guest Producer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
