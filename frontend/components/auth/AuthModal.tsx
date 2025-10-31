"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { isOpen, close, mode, toggleMode } = useAuthModal();
  const { login, register, status } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({ username: "", password: "", email: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      setFormState({ username: "", password: "", email: "" });
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalTarget(document.getElementById("modal-root"));
  }, []);

  if (!mounted || !portalTarget) {
    return null;
  }

  const handleFieldChange = (field: "username" | "password" | "email") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const { username, password, email } = formState;

    if (!username.trim() || !password.trim() || (mode === "register" && !email.trim())) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "login") {
        await login(username.trim(), password.trim());
      } else {
        await register({ username: username.trim(), password: password.trim(), email: email.trim() });
      }
      close();
    } catch (authError) {
      console.error(authError);
      setError("We couldn't authenticate you. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 px-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close authentication modal"
        onClick={close}
      />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "login"
                  ? "Sign in to vote, like, and create polls."
                  : "Join QuickPoll to share and explore community sentiment."}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="auth-username">
              Username
            </label>
            <input
              id="auth-username"
              name="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={formState.username}
              onChange={handleFieldChange("username")}
              required
            />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                value={formState.email}
                onChange={handleFieldChange("email")}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={formState.password}
              onChange={handleFieldChange("password")}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            className={cn(
              "mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400",
              isSubmitting && "cursor-progress opacity-80",
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>

        <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <span>{mode === "login" ? "Don’t have an account?" : "Already have an account?"}</span>
          <button
            type="button"
            className="ml-2 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            onClick={toggleMode}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
