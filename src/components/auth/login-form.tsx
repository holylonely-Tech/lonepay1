"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/components/auth/auth-provider";
import {
  FormAlert,
  FormField,
  authInputClasses,
} from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { login, loginSchema, type LoginValues } from "@/lib/auth";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const user = await login(values);
      setUser(user);
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const emailError = error.firstError("email");
        if (emailError) {
          setError("email", { message: emailError });
          return;
        }

        const passwordError = error.firstError("password");
        if (passwordError) {
          setError("password", { message: passwordError });
          return;
        }

        setFormError(error.message);
        return;
      }

      setFormError("We could not sign you in right now. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError ? <FormAlert variant="error">{formError}</FormAlert> : null}

      <FormField id="login-email" label="Email" error={errors.email?.message}>
        <input
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          className={authInputClasses(Boolean(errors.email))}
          disabled={isSubmitting}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="login-password"
        label="Password"
        error={errors.password?.message}
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="Your password"
          hasError={Boolean(errors.password)}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          disabled={isSubmitting}
          {...register("password")}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
