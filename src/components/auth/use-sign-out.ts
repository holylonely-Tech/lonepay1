"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { logout } from "@/lib/auth";

/**
 * Signs the current user out through the API (invalidating the Sanctum session
 * server-side), clears the in-memory user, then sends the visitor to a public
 * page. Reports failures instead of pretending the sign-out succeeded.
 */
export function useSignOut(redirectTo = "/") {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setError(null);

    try {
      await logout();
      setUser(null);
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError(
        "We could not sign you out. Please check your connection and try again.",
      );
      setIsSigningOut(false);
    }
  }, [isSigningOut, redirectTo, router, setUser]);

  return { signOut, isSigningOut, error };
}
