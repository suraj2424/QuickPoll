"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { cn } from "@/lib/utils";
import { X, Vote } from "lucide-react";

export function AuthModal() {
  const { isOpen, close, mode, toggleMode } = useAuthModal();
  const { login, register } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", email: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      setForm({ username: "", password: "", email: "" });
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalTarget(document.getElementById("modal-root"));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !portalTarget || !isOpen) {
    return null;
  }

  const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { username, password, email } = form;

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (mode === "register" && !email.trim()) {
      setError("Email is required");
      return;
    }
    if (mode === "register" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "login") {
        await login(username.trim(), password.trim());
      } else {
        await register({
          username: username.trim(),
          password: password.trim(),
          email: email.trim(),
        });
      }
      close();
    } catch (err) {
      console.error(err);
      setError(
        mode === "login"
          ? "Invalid username or password"
          : "Could not create account. Username may already exist."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLogin = mode === "login";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isLogin ? "Sign in to your account" : "Join the community"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="auth-username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Username
            </label>
            <input
              id="auth-username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={updateField("username")}
              disabled={isSubmitting}
              placeholder="Enter your username"
              className={cn(
                "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
                "border border-zinc-200 dark:border-zinc-700",
                "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
                "focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>

          {/* Email (Register only) */}
          {!isLogin && (
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={updateField("email")}
                disabled={isSubmitting}
                placeholder="you@example.com"
                className={cn(
                  "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
                  "focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                required
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={updateField("password")}
              disabled={isSubmitting}
              placeholder={isLogin ? "Enter your password" : "Create a password (min 6 chars)"}
              className={cn(
                "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
                "border border-zinc-200 dark:border-zinc-700",
                "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
                "focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full py-2.5 text-sm font-semibold transition-colors",
              "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
              "hover:from-indigo-600 hover:to-purple-700",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
              isSubmitting && "opacity-70 cursor-wait"
            )}
          >
            {isSubmitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">
                {isLogin ? "New to QuickPoll?" : "Already have an account?"}
              </span>
            </div>
          </div>

          {/* Toggle Mode */}
          <button
            type="button"
            onClick={toggleMode}
            className={cn(
              "w-full py-2 text-sm font-medium transition-colors",
              "border border-zinc-200 dark:border-zinc-700",
              "text-zinc-700 dark:text-zinc-300",
              "hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
          >
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>,
    portalTarget
  );
}