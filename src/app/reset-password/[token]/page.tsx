import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password — LonePay",
  description: "Set a new password for your LonePay account.",
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { token } = await params;
  const { email } = await searchParams;
  const initialEmail = typeof email === "string" ? email : "";

  return (
    <AuthShell
      title="Choose a new password"
      description="Set a new password for your LonePay account."
    >
      <ResetPasswordForm token={token} email={initialEmail} />
    </AuthShell>
  );
}
