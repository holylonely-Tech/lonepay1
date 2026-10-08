import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
    resendVerificationEmail: vi.fn(),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";
import { fetchCurrentUser, resendVerificationEmail } from "@/lib/auth";

const unverifiedUser = {
  id: 7,
  name: "Ada Obi",
  email: "ada@example.com",
  email_verified: false,
  email_verified_at: null,
  created_at: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("VerifyEmailPanel", () => {
  it("confirms success when the link was just verified", () => {
    render(
      <AuthProvider>
        <VerifyEmailPanel justRegistered={false} justVerified />
      </AuthProvider>,
    );

    expect(screen.getByText("Email verified")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go to dashboard/i }),
    ).toBeInTheDocument();
  });

  it("invites a signed-out visitor to sign in", async () => {
    render(
      <AuthProvider>
        <VerifyEmailPanel justRegistered={false} justVerified={false} />
      </AuthProvider>,
    );

    expect(
      await screen.findByText(
        /sign in to your account to resend the verification email/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the pending email and resends a link", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue(unverifiedUser);
    vi.mocked(resendVerificationEmail).mockResolvedValue(
      "A fresh verification link has been sent.",
    );

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <VerifyEmailPanel justRegistered justVerified={false} />
      </AuthProvider>,
    );

    expect(await screen.findByText("ada@example.com")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /resend verification email/i }),
    );

    expect(
      await screen.findByText("A fresh verification link has been sent."),
    ).toBeInTheDocument();
  });
});
