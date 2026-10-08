"use client";

import { LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useSignOut } from "@/components/auth/use-sign-out";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import type { AuthUser } from "@/lib/auth";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

function accountLabel(user: AuthUser | null): string {
  const firstName = user?.name.trim().split(/\s+/)[0];
  return firstName || "Account";
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, status } = useAuth();
  const { signOut, isSigningOut, error } = useSignOut();

  const isResolving = status === "loading" || status === "error";
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-200",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-md shadow-sm"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="LonePay Home" className="shrink-0">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="relative hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {isResolving ? (
            <span
              aria-hidden="true"
              className="h-9 w-36 animate-pulse rounded-xl bg-surface-raised"
            />
          ) : status === "authenticated" ? (
            <>
              <ButtonLink href="/dashboard" variant="ghost" size="sm">
                <UserRound className="size-4" aria-hidden="true" />
                {accountLabel(user)}
              </ButtonLink>
              <Button
                variant="secondary"
                size="sm"
                onClick={signOut}
                disabled={isSigningOut}
              >
                <LogOut className="size-4" aria-hidden="true" />
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Open Free Account
              </ButtonLink>
            </>
          )}

          {error ? (
            <p
              role="alert"
              className="absolute top-full right-0 mt-2 w-64 rounded-lg border border-error/40 bg-surface-card px-3 py-2 text-right text-xs text-error shadow-card"
            >
              {error}
            </p>
          ) : null}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="secondary"
            size="icon"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-surface px-4 py-5 shadow-2xl lg:hidden"
      >
        <Container className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
            {status === "authenticated" ? (
              <>
                <ButtonLink
                  href="/dashboard"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={closeMenu}
                >
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  {accountLabel(user)}
                </ButtonLink>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={signOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {isSigningOut ? "Signing out…" : "Sign out"}
                </Button>
              </>
            ) : status === "unauthenticated" ? (
              <>
                <ButtonLink
                  href="/register"
                  size="md"
                  className="w-full"
                  onClick={closeMenu}
                >
                  Open Free Account
                </ButtonLink>
                <ButtonLink
                  href="/login"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={closeMenu}
                >
                  Sign in
                </ButtonLink>
              </>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            ) : null}
          </div>
        </Container>
      </div>
    </header>
  );
}
