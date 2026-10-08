import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
    resetPassword: vi.fn(),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { resetPassword } from "@/lib/auth";

const mockedReset = vi.mocked(resetPassword);

function renderForm() {
  return render(
    <AuthProvider>
      <ResetPasswordForm token="token-abc" email="ada@example.com" />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ResetPasswordForm", () => {
  it("prefills the email from the reset link", () => {
    renderForm();

    expect(screen.getByLabelText(/^email$/i)).toHaveValue("ada@example.com");
  });

  it("blocks mismatched passwords", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^new password$/i), "secret123");
    await user.type(
      screen.getByLabelText(/^confirm new password$/i),
      "different123",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("submits the token with the new password and confirms success", async () => {
    mockedReset.mockResolvedValueOnce("Your password has been reset.");

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^new password$/i), "secret123");
    await user.type(
      screen.getByLabelText(/^confirm new password$/i),
      "secret123",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText("Password updated")).toBeInTheDocument();
    expect(mockedReset).toHaveBeenCalledWith({
      token: "token-abc",
      email: "ada@example.com",
      password: "secret123",
      password_confirmation: "secret123",
    });
  });

  it("shows a server error when the token is rejected", async () => {
    const { ApiError } = await import("@/lib/api");
    mockedReset.mockRejectedValueOnce(
      new ApiError("This password reset token is invalid.", 422, {
        email: ["This password reset token is invalid."],
      }),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^new password$/i), "secret123");
    await user.type(
      screen.getByLabelText(/^confirm new password$/i),
      "secret123",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(
      await screen.findByText("This password reset token is invalid."),
    ).toBeInTheDocument();
  });
});
