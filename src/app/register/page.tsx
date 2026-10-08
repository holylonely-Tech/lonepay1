import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account — LonePay",
  description:
    "Create a free LonePay account to recharge airtime, buy data, pay electricity bills, and renew cable TV subscriptions.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your free account"
      description="Join LonePay to pay for airtime, data, electricity, cable TV, and more."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
