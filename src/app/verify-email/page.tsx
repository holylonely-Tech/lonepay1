import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify your email — LonePay",
  description: "Confirm your email address to activate your LonePay account.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    verified?: string | string[];
    registered?: string | string[];
  }>;
}) {
  const { verified, registered } = await searchParams;

  return (
    <AuthShell
      title="Email verification"
      description="Confirm your email address to unlock your LonePay account."
    >
      <VerifyEmailPanel
        justRegistered={registered === "1"}
        justVerified={verified === "1"}
      />
    </AuthShell>
  );
}
