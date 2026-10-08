"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  FormAlert,
  FormField,
  authInputClasses,
} from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  resetPassword,
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth";

type ResetPasswordFormProps = {
  token: string;
  email: string;
};

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      const message = await resetPassword(values);
      setSuccessMessage(message);
    } catch (error) {
      if (error instanceof ApiError) {
        let handled = false;

        for (const field of [
          "email",
          "password",
          "password_confirmation",
          "token",
        ] as const) {
          const message = error.firstError(field);
          if (message) {
            if (field === "token") {
              setFormError(message);
            } else {
              setError(field, { message });
            }
            handled = true;
          }
        }

        if (!handled) {
          setFormError(error.message);
        }

        return;
      }

      setFormError(
        "We could not reset your password right now. Please try again.",
      );
    }
  }

  if (successMessage) {
    return (
      <div className="space-y-5">
        <FormAlert variant="success">
          <p className="font-semibold text-foreground">Password updated</p>
          <p className="mt-1 text-subtle">
            Your password has been changed. You can now sign in with your new
            password.
          </p>
        </FormAlert>

        <Button asChild size="lg" className="w-full">
          <Link href="/login">Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError ? <FormAlert variant="error">{formError}</FormAlert> : null}

      <input type="hidden" {...register("token")} />

      <FormField id="reset-email" label="Email" error={errors.email?.message}>
        <input
          id="reset-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "reset-email-error" : undefined}
          className={authInputClasses(Boolean(errors.email))}
          disabled={isSubmitting}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="reset-password"
        label="New password"
        error={errors.password?.message}
        hint="At least 8 characters, including a letter and a number."
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          placeholder="Enter a new password"
          hasError={Boolean(errors.password)}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password ? "reset-password-error" : undefined
          }
          disabled={isSubmitting}
          {...register("password")}
        />
      </FormField>

      <FormField
        id="reset-password-confirmation"
        label="Confirm new password"
        error={errors.password_confirmation?.message}
      >
        <PasswordInput
          id="reset-password-confirmation"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          hasError={Boolean(errors.password_confirmation)}
          aria-invalid={errors.password_confirmation ? true : undefined}
          aria-describedby={
            errors.password_confirmation
              ? "reset-password-confirmation-error"
              : undefined
          }
          disabled={isSubmitting}
          {...register("password_confirmation")}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating password…" : "Update password"}
      </Button>

      <p className="text-center text-sm text-subtle">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
