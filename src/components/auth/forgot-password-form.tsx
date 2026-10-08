"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  FormAlert,
  FormField,
  authInputClasses,
} from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  forgotPasswordSchema,
  requestPasswordReset,
  type ForgotPasswordValues,
} from "@/lib/auth";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const message = await requestPasswordReset(values.email);
      setSentMessage(message);
    } catch (error) {
      if (error instanceof ApiError) {
        const emailError = error.firstError("email");
        if (emailError) {
          setError("email", { message: emailError });
          return;
        }

        setFormError(error.message);
        return;
      }

      setFormError(
        "We could not send the reset link right now. Please try again.",
      );
    }
  }

  if (sentMessage) {
    return (
      <div className="space-y-5">
        <FormAlert variant="success">
          <p className="font-semibold text-foreground">Check your inbox</p>
          <p className="mt-1 text-subtle">
            If an account exists for{" "}
            <span className="font-medium text-foreground">
              {getValues("email")}
            </span>
            , we sent a link to reset your password. The link expires shortly,
            so use it soon.
          </p>
        </FormAlert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError ? <FormAlert variant="error">{formError}</FormAlert> : null}

      <FormField
        id="forgot-email"
        label="Email"
        error={errors.email?.message}
        hint="Enter the email address linked to your LonePay account."
      >
        <input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "forgot-email-error" : undefined}
          className={authInputClasses(Boolean(errors.email))}
          disabled={isSubmitting}
          {...register("email")}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending link…" : "Send reset link"}
      </Button>
    </form>
  );
}
