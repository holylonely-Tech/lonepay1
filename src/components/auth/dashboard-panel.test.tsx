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
    logout: vi.fn(),
  };
});

vi.mock("@/lib/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wallet")>();
  return {
    ...actual,
    fetchWallet: vi.fn().mockResolvedValue({
      id: 1,
      currency: "NGN",
      balance: "0.00",
      status: "active",
      updated_at: null,
    }),
    fetchWalletTransactions: vi.fn().mockResolvedValue({
      data: [],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
      },
    }),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { DashboardPanel } from "@/components/auth/dashboard-panel";
import { fetchCurrentUser, logout } from "@/lib/auth";

function renderPanel() {
  return render(
    <AuthProvider>
      <DashboardPanel />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DashboardPanel", () => {
  it("shows the signed-in user's details", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 1,
      name: "Ada Obi",
      email: "ada@example.com",
      email_verified: true,
      email_verified_at: "2026-01-01T00:00:00+00:00",
      created_at: null,
    });

    renderPanel();

    expect(await screen.findByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Email verified")).toBeInTheDocument();
  });

  it("renders the wallet summary and empty history from the API", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 1,
      name: "Ada Obi",
      email: "ada@example.com",
      email_verified: true,
      email_verified_at: null,
      created_at: null,
    });

    renderPanel();

    expect(await screen.findByText(/wallet balance/i)).toBeInTheDocument();
    expect(await screen.findByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it("prompts unverified users to verify their email", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 1,
      name: "Ada Obi",
      email: "ada@example.com",
      email_verified: false,
      email_verified_at: null,
      created_at: null,
    });

    renderPanel();

    expect(await screen.findByText(/email not verified/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /verify now/i }),
    ).toBeInTheDocument();
  });

  it("signs the user out and returns to the home page", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 1,
      name: "Ada Obi",
      email: "ada@example.com",
      email_verified: true,
      email_verified_at: null,
      created_at: null,
    });
    vi.mocked(logout).mockResolvedValue();

    const user = userEvent.setup();
    renderPanel();

    await user.click(await screen.findByRole("button", { name: /sign out/i }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
