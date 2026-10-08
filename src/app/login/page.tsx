import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — LonePay",
  description:
    "Sign in to your LonePay account to manage your wallet, airtime, data, and bill payments.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const redirectTo =
    typeof next === "string" && next.startsWith("/") ? next : "/dashboard";

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your LonePay wallet and services."
      footer={
        <>
          New to LonePay?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create a free account
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />

      <p className="mt-4 text-center text-sm text-subtle">
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </p>
    </AuthShell>
  );
}
