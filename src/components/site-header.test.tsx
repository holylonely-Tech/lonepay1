import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/lib/auth";

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

type MockAuth = {
  user: AuthUser | null;
  status: string;
  setUser: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
};

const auth = vi.hoisted(() => ({
  value: {
    user: null,
    status: "unauthenticated",
    setUser: vi.fn(),
    refresh: vi.fn(),
  } as MockAuth,
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => auth.value,
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, logout: vi.fn() };
});

import { SiteHeader } from "@/components/site-header";
import { logout } from "@/lib/auth";

const ada: AuthUser = {
  id: 1,
  name: "Ada Obi",
  email: "ada@example.com",
  email_verified: true,
  email_verified_at: null,
  created_at: null,
};

function setAuth(status: string, user: AuthUser | null = null) {
  auth.value.status = status;
  auth.value.user = user;
}

function getDrawer(): HTMLElement {
  const drawer = document.getElementById("mobile-nav");
  if (!drawer) {
    throw new Error("Mobile drawer not found");
  }
  return drawer;
}

beforeEach(() => {
  vi.clearAllMocks();
  setAuth("unauthenticated", null);
});

afterEach(cleanup);

describe("SiteHeader signed-out state", () => {
  it("shows Sign in and the registration CTA", () => {
    setAuth("unauthenticated");
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Open Free Account" }),
    ).toHaveAttribute("href", "/register");
    expect(screen.queryByRole("button", { name: /sign out/i })).toBeNull();
  });

  it("keeps a single Contact Us link in the desktop nav", () => {
    render(<SiteHeader />);

    const desktopNav = screen.getByRole("navigation", { name: "Main" });
    const contactLinks = within(desktopNav).getAllByRole("link", {
      name: "Contact Us",
    });

    expect(contactLinks).toHaveLength(1);
    expect(contactLinks[0]).toHaveAttribute("href", "/contact");
  });

  it("keeps the existing primary navigation links without duplicates", () => {
    render(<SiteHeader />);

    const desktopNav = screen.getByRole("navigation", { name: "Main" });
    const labels = within(desktopNav)
      .getAllByRole("link")
      .map((link) => link.textContent);

    [
      "Services",
      "How It Works",
      "Providers",
      "Security",
      "FAQ",
      "Contact Us",
    ].forEach((label) => {
      expect(labels).toContain(label);
    });
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("SiteHeader authenticated state", () => {
  it("replaces Sign in with an account link and a Sign out action", () => {
    setAuth("authenticated", ada);
    render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Open Free Account" }),
    ).toBeNull();

    expect(screen.getByRole("link", { name: /ada/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("does not expose the user's email address", () => {
    setAuth("authenticated", ada);
    render(<SiteHeader />);

    expect(screen.queryByText(/ada@example\.com/i)).toBeNull();
  });
});

describe("SiteHeader session loading", () => {
  it("shows neither Sign in nor Sign out while the session resolves", () => {
    setAuth("loading", null);
    const { container } = render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("button", { name: /sign out/i })).toBeNull();
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("does not falsely report a signed-out visitor when the session errored", () => {
    setAuth("error", null);
    render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("button", { name: /sign out/i })).toBeNull();
  });
});

describe("SiteHeader mobile navigation", () => {
  it("offers Sign in and registration to signed-out visitors and closes on selection", async () => {
    setAuth("unauthenticated");
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const drawer = getDrawer();

    const labels = within(drawer)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(new Set(labels).size).toBe(labels.length);

    expect(
      within(drawer).getByRole("link", { name: "Contact Us" }),
    ).toHaveAttribute("href", "/contact");

    const signIn = within(drawer).getByRole("link", { name: "Sign in" });
    expect(signIn).toHaveAttribute("href", "/login");

    await user.click(signIn);
    expect(getDrawer().hidden).toBe(true);
  });

  it("offers Account and Sign out to authenticated visitors", async () => {
    setAuth("authenticated", ada);
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const drawer = getDrawer();

    expect(within(drawer).getByRole("link", { name: /ada/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(
      within(drawer).getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
    expect(within(drawer).queryByRole("link", { name: "Sign in" })).toBeNull();
  });
});

describe("SiteHeader sign out", () => {
  it("logs out, clears the user, and returns to the home page", async () => {
    setAuth("authenticated", ada);
    vi.mocked(logout).mockResolvedValueOnce();
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(auth.value.setUser).toHaveBeenCalledWith(null);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("reports a failure and keeps the user signed in when logout fails", async () => {
    setAuth("authenticated", ada);
    vi.mocked(logout).mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not sign you out/i,
    );
    expect(auth.value.setUser).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
