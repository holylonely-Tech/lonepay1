"use client";

import { BadgeCheck, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FormAlert } from "@/components/auth/form-field";
import { useSignOut } from "@/components/auth/use-sign-out";
import { Button } from "@/components/ui/button";
import { WalletSection } from "@/components/wallet/wallet-section";

export function DashboardPanel() {
  const { user, status, refresh } = useAuth();
  const { signOut, isSigningOut, error: signOutError } = useSignOut();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="text-sm text-subtle">Loading your account…</p>;
  }

  if (status === "error") {
    return (
      <div className="space-y-5">
        <FormAlert variant="error">
          We could not check your session. This usually means the server is
          unreachable, not that you are signed out.
        </FormAlert>
        <button
          type="button"
          onClick={() => void refresh()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
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

      <WalletSection />

      {signOutError ? (
        <p role="alert" className="text-sm text-error">
          {signOutError}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={signOut}
        disabled={isSigningOut}
      >
        <LogOut className="size-4" aria-hidden="true" />
        {isSigningOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}
