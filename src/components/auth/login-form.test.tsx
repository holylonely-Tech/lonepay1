import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth";

const mockedLogin = vi.mocked(login);

function renderForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("renders labelled email and password fields", () => {
    renderForm();

    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: /^sign in$/i }),
    ).toBeInTheDocument();
  });

  it("blocks empty submission with inline validation", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText("Please enter your email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please enter your password.")).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("signs in and redirects to the requested page", async () => {
    mockedLogin.mockResolvedValueOnce({
      id: 1,
      name: "Ada Obi",
      email: "ada@example.com",
      email_verified: true,
      email_verified_at: null,
      created_at: null,
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <LoginForm redirectTo="/wallet" />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/wallet"));
    expect(mockedLogin).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret123",
    });
  });

  it("surfaces the server error for invalid credentials", async () => {
    mockedLogin.mockRejectedValueOnce(
      new ApiError("These credentials do not match our records.", 422, {
        email: ["These credentials do not match our records."],
      }),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpass1");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText("These credentials do not match our records."),
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});
