import { z } from "zod";

import { ApiError, apiRequest } from "@/lib/api";

/**
 * Auth request schemas and API calls.
 *
 * Validation mirrors the Laravel rules in `backend/app/Http/Requests/Auth`:
 * names 2-120 characters, valid unique emails, and passwords of at least eight
 * characters containing both a letter and a number.
 */

const emailField = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .max(255, "Email must be 255 characters or fewer.")
  .email("Please enter a valid email address, e.g. name@example.com.");

const newPasswordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(255, "Password must be 255 characters or fewer.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Please enter your password."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(120, "Name must be 120 characters or fewer."),
    email: emailField,
    password: newPasswordField,
    password_confirmation: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is missing its token."),
    email: emailField,
    password: newPasswordField,
    password_confirmation: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string | null;
};

type DataResponse<T> = { data: T };
type MessageResponse = { message: string };

/** Returns the signed-in user, or `null` when there is no active session. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest<DataResponse<AuthUser>>("/api/user");
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) {
      return null;
    }

    throw error;
  }
}

export async function login(values: LoginValues): Promise<AuthUser> {
  const response = await apiRequest<DataResponse<AuthUser>>("/api/login", {
    method: "POST",
    body: values,
  });

  return response.data;
}

export async function register(values: RegisterValues): Promise<AuthUser> {
  const response = await apiRequest<DataResponse<AuthUser>>("/api/register", {
    method: "POST",
    body: values,
  });

  return response.data;
}

export async function logout(): Promise<void> {
  await apiRequest<MessageResponse>("/api/logout", { method: "POST" });
}

/**
 * Requests a reset link. The API always returns the same message so the
 * endpoint cannot be used to discover which emails have accounts.
 */
export async function requestPasswordReset(email: string): Promise<string> {
  const response = await apiRequest<MessageResponse>("/api/forgot-password", {
    method: "POST",
    body: { email },
  });

  return response.message;
}

export async function resetPassword(
  values: ResetPasswordValues,
): Promise<string> {
  const response = await apiRequest<MessageResponse>("/api/reset-password", {
    method: "POST",
    body: values,
  });

  return response.message;
}

export async function resendVerificationEmail(): Promise<string> {
  const response = await apiRequest<MessageResponse>(
    "/api/email/verification-notification",
    { method: "POST" },
  );

  return response.message;
}
