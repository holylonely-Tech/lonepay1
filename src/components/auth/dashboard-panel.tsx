"use client";

import { BadgeCheck, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

export function DashboardPanel() {
  const { user, status, setUser } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/dashboard");
    }
  }, [status, router]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await logout();
    } catch {
      // Even if the API call fails, drop the local session so the UI is safe.
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-subtle">Loading your account…</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-subtle">
        You are not signed in. Redirecting to sign in…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-strong bg-surface-card p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-lg font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-subtle">{user.email}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm">
          {user.email_verified ? (
            <>
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              <span className="text-subtle">Email verified</span>
            </>
          ) : (
            <>
              <ShieldAlert className="size-4 text-warning" aria-hidden="true" />
              <span className="text-subtle">
                Email not verified ·{" "}
                <Link
                  href="/verify-email"
                  className="font-medium text-primary hover:underline"
                >
                  Verify now
                </Link>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-raised p-6">
        <h2 className="text-base font-semibold text-foreground">
          Your wallet is coming soon
        </h2>
        <p className="mt-2 text-sm text-subtle">
          Wallet funding, airtime, data, and bill payments will appear here once
          they are enabled for your account.
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        <LogOut className="size-4" aria-hidden="true" />
        {isSigningOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}
