"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FormAlert } from "@/components/auth/form-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { resendVerificationEmail } from "@/lib/auth";

type VerifyEmailPanelProps = {
  justRegistered: boolean;
  justVerified: boolean;
};

export function VerifyEmailPanel({
  justRegistered,
  justVerified,
}: VerifyEmailPanelProps) {
  const { user, status } = useAuth();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleResend() {
    setIsSending(true);
    setResendMessage(null);
    setResendError(null);

    try {
      setResendMessage(await resendVerificationEmail());
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setResendError(
          "Too many attempts. Please wait a moment and try again.",
        );
      } else if (error instanceof ApiError && error.isUnauthenticated) {
        setResendError("Please sign in again to request a new link.");
      } else {
        setResendError(
          "We could not send a new link right now. Please try again.",
        );
      }
    } finally {
      setIsSending(false);
    }
  }

  if (justVerified) {
    return (
      <div className="space-y-5">
        <FormAlert variant="success">
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Email verified</p>
              <p className="mt-1 text-subtle">
                Your email address is confirmed. You can now use your LonePay
                account.
              </p>
            </div>
          </div>
        </FormAlert>
        <ButtonLink href="/dashboard" size="lg" className="w-full">
          Go to dashboard
        </ButtonLink>
      </div>
    );
  }

  if (status === "loading") {
    return <p className="text-sm text-subtle">Checking your session…</p>;
  }

  if (user?.email_verified) {
    return (
      <div className="space-y-5">
        <FormAlert variant="success">
          Your email address is already verified.
        </FormAlert>
        <ButtonLink href="/dashboard" size="lg" className="w-full">
          Go to dashboard
        </ButtonLink>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <FormAlert variant="info">
          Sign in to your account to resend the verification email.
        </FormAlert>
        <ButtonLink href="/login" size="lg" className="w-full">
          Sign in
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FormAlert variant="info">
        <p className="font-semibold text-foreground">
          Verify your email address
        </p>
        <p className="mt-1 text-subtle">
          {justRegistered
            ? "We sent a verification link to "
            : "We will send a fresh verification link to "}
          <span className="font-medium text-foreground">{user.email}</span>.
          Open the link in that email to confirm your account.
        </p>
      </FormAlert>

      {resendMessage ? (
        <FormAlert variant="success">{resendMessage}</FormAlert>
      ) : null}
      {resendError ? (
        <FormAlert variant="error">{resendError}</FormAlert>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleResend}
        disabled={isSending}
      >
        {isSending ? "Sending…" : "Resend verification email"}
      </Button>

      {justRegistered ? null : (
        <p className="text-center text-sm text-subtle">
          Wrong account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in with another account
          </Link>
        </p>
      )}
    </div>
  );
}
