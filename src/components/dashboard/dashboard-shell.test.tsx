import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

let pathname = "/dashboard";

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => pathname,
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
  };
});

import { AuthProvider } from "@/components/auth/auth-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { fetchCurrentUser, type AuthUser } from "@/lib/auth";

const user: AuthUser = {
  id: 1,
  name: "Ada Obi",
  email: "ada@example.com",
  email_verified: true,
  email_verified_at: "2026-01-01T00:00:00+00:00",
  created_at: null,
};

function renderShell() {
  return render(
    <AuthProvider>
      <DashboardShell>
        <p>Panel content</p>
      </DashboardShell>
    </AuthProvider>,
  );
}

beforeEach(() => {
  pathname = "/dashboard";
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DashboardShell", () => {
  it("renders the sidebar and main content for a signed-in user", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue(user);

    renderShell();

    expect(await screen.findByText("Panel content")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /dashboard/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /sign out/i }).length,
    ).toBeGreaterThan(0);
  });

  it("redirects a guest to sign in with a next path", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue(null);

    renderShell();

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/login?next=%2Fdashboard"),
    );
  });

  it("opens the mobile navigation drawer", async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue(user);

    renderShell();

    await screen.findByText("Panel content");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /open navigation menu/i }));

    expect(
      screen.getByRole("dialog", { name: /dashboard navigation/i }),
    ).toBeInTheDocument();
  });
});
