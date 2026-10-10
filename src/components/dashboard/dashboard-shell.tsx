"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FormAlert } from "@/components/auth/form-field";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-sunken px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, status, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    const next = pathname.startsWith("/dashboard")
      ? `?next=${encodeURIComponent(pathname)}`
      : "";

    router.replace(`/login${next}`);
  }, [status, pathname, router]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (status === "loading") {
    return (
      <CenteredMessage>
        <p className="text-center text-sm text-subtle">Loading your account…</p>
      </CenteredMessage>
    );
  }

  if (status === "error") {
    return (
      <CenteredMessage>
        <div className="space-y-4">
          <FormAlert variant="error">
            We could not check your session. This usually means the server is
            unreachable, not that you are signed out.
          </FormAlert>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refresh()}
          >
            Try again
          </Button>
        </div>
      </CenteredMessage>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <CenteredMessage>
        <p className="text-center text-sm text-subtle">
          You are not signed in. Redirecting to sign in…
        </p>
      </CenteredMessage>
    );
  }

  return (
    <div className="min-h-screen bg-surface-sunken text-foreground">
      <div className="lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface lg:block">
          <DashboardSidebar />
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden">
            <Link href="/" aria-label="LonePay Home" className="shrink-0">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label={
                  menuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={menuOpen}
                aria-controls="dashboard-nav"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/40 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <div
            id="dashboard-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border bg-surface shadow-card"
          >
            <DashboardSidebar onNavigate={closeMenu} onClose={closeMenu} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
