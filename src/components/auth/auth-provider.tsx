"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchCurrentUser, type AuthUser } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the current session in memory only. The browser's httpOnly session
 * cookie is the source of truth; this provider hydrates it once on mount and
 * is updated after sign in, sign up, or sign out.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchCurrentUser();
      setUser(next);
      return next;
    } catch {
      setStatus("error");
      return null;
    }
  }, [setUser]);

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((next) => {
        if (active) {
          setUser(next);
        }
      })
      .catch(() => {
        // A network or server failure is not the same as being signed out:
        // keep the state unresolved instead of falsely reporting a guest.
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, setUser, refresh }),
    [user, status, setUser, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
