"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AuthUser } from "@/lib/types";
import { fetchCurrentUser, loginUser, registerUser } from "@/lib/auth-api";

type AuthStatus = "unauthenticated" | "authenticating" | "authenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "quickpoll:user";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [status, setStatus] = useState<AuthStatus>(() =>
    user ? "authenticating" : "unauthenticated",
  );
  const userId = user?.userId ?? null;

  useEffect(() => {
    let cancelled = false;

    const scheduleStatusUpdate = (next: AuthStatus) => {
      setTimeout(() => {
        if (!cancelled) {
          setStatus(next);
        }
      }, 0);
    };

    if (!userId) {
      scheduleStatusUpdate("unauthenticated");
      return;
    }

    const verifyUser = async () => {
      try {
        scheduleStatusUpdate("authenticating");
        const freshUser = await fetchCurrentUser(userId);
        if (cancelled) return;
        setUser(freshUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
        scheduleStatusUpdate("authenticated");
      } catch (error) {
        console.error("Failed to refresh user", error);
        if (cancelled) return;
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
        scheduleStatusUpdate("unauthenticated");
      }
    };

    verifyUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const login = useCallback(async (username: string, password: string) => {
    setStatus("authenticating");
    const authUser = await loginUser(username, password);
    setUser(authUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setStatus("authenticated");
  }, []);

  const register = useCallback(
    async (payload: { username: string; email: string; password: string }) => {
      setStatus("authenticating");
      const authUser = await registerUser(payload);
      setUser(authUser);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [login, logout, register, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
