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
    register: vi.fn(),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { RegisterForm } from "@/components/auth/register-form";
import { ApiError } from "@/lib/api";
import { register } from "@/lib/auth";

const mockedRegister = vi.mocked(register);

function renderForm() {
  return render(
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^full name$/i), "Ada Obi");
  await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "secret123");
  await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RegisterForm", () => {
  it("renders labelled name, email and password fields", () => {
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>,
    );

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("requires a strong password", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "weak");
    await user.type(screen.getByLabelText(/confirm password/i), "weak");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("flags mismatched password confirmation", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(
      screen.getByLabelText(/^confirm password$/i),
      "different123",
    );

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("creates the account and routes to email verification", async () => {
    mockedRegister.mockResolvedValueOnce({
      id: 1,
      name: "Ada Obi",
      email: "ada@example.com",
      email_verified: false,
      email_verified_at: null,
      created_at: null,
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith("/verify-email?registered=1"),
    );
  });

  it("surfaces a server-side duplicate email error", async () => {
    mockedRegister.mockRejectedValueOnce(
      new ApiError("The email has already been taken.", 422, {
        email: ["The email has already been taken."],
      }),
    );

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/^confirm password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText("The email has already been taken."),
    ).toBeInTheDocument();
  });
});
