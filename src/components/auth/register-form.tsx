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
import { register, registerSchema, type RegisterValues } from "@/lib/auth";

export function RegisterForm() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const user = await register(values);
      setUser(user);
      router.push("/verify-email?registered=1");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        let handled = false;

        for (const field of [
          "name",
          "email",
          "password",
          "password_confirmation",
        ] as const) {
          const message = error.firstError(field);
          if (message) {
            setError(field, { message });
            handled = true;
          }
        }

        if (!handled) {
          setFormError(error.message);
        }

        return;
      }

      setFormError(
        "We could not create your account right now. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError ? <FormAlert variant="error">{formError}</FormAlert> : null}

      <FormField
        id="register-name"
        label="Full name"
        error={errors.name?.message}
      >
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          className={authInputClasses(Boolean(errors.name))}
          disabled={isSubmitting}
          {...registerField("name")}
        />
      </FormField>

      <FormField
        id="register-email"
        label="Email"
        error={errors.email?.message}
      >
        <input
          id="register-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          className={authInputClasses(Boolean(errors.email))}
          disabled={isSubmitting}
          {...registerField("email")}
        />
      </FormField>

      <FormField
        id="register-password"
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters, including a letter and a number."
      >
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          placeholder="Create a password"
          hasError={Boolean(errors.password)}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
          disabled={isSubmitting}
          {...registerField("password")}
        />
      </FormField>

      <FormField
        id="register-password-confirmation"
        label="Confirm password"
        error={errors.password_confirmation?.message}
      >
        <PasswordInput
          id="register-password-confirmation"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          hasError={Boolean(errors.password_confirmation)}
          aria-invalid={errors.password_confirmation ? true : undefined}
          aria-describedby={
            errors.password_confirmation
              ? "register-password-confirmation-error"
              : undefined
          }
          disabled={isSubmitting}
          {...registerField("password_confirmation")}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
