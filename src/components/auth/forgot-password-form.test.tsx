import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
    requestPasswordReset: vi.fn(),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { requestPasswordReset } from "@/lib/auth";

const mockedRequest = vi.mocked(requestPasswordReset);

function renderForm() {
  return render(
    <AuthProvider>
      <ForgotPasswordForm />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ForgotPasswordForm", () => {
  it("requires a valid email before submitting", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(
      await screen.findByText("Please enter your email address."),
    ).toBeInTheDocument();
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it("shows a neutral confirmation after requesting a link", async () => {
    mockedRequest.mockResolvedValueOnce(
      "If an account exists for that email, a password reset link has been sent.",
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText("Check your inbox")).toBeInTheDocument();
    expect(mockedRequest).toHaveBeenCalledWith("ada@example.com");
  });
});
