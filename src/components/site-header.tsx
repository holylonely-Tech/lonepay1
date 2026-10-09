"use client";

import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useSignOut } from "@/components/auth/use-sign-out";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import type { AuthUser } from "@/lib/auth";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

const HEADER_OFFSET = 80;

const navLinkClass =
  "rounded-lg px-3 py-2.5 text-sm font-medium text-subtle transition-colors hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const menuItemClass =
  "block rounded-xl px-3 py-2.5 text-sm font-medium text-subtle transition-colors hover:bg-primary-soft hover:text-primary focus-visible:bg-primary-soft focus-visible:text-primary focus-visible:outline-none active:bg-primary-soft";

function accountLabel(user: AuthUser | null): string {
  const firstName = user?.name.trim().split(/\s+/)[0];
  return firstName || "Account";
}

function scrollToSection(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) {
    return;
  }

  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  const top =
    target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const { user, status } = useAuth();
  const { signOut, isSigningOut, error } = useSignOut();
  const pathname = usePathname();

  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const exploreMenuRef = useRef<HTMLUListElement>(null);
  const focusFirstItemRef = useRef(false);

  const isResolving = status === "loading" || status === "error";
  const closeMenu = useCallback(() => {
    setOpen(false);
    setMobileExploreOpen(false);
  }, []);

  const handleHashClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.includes("#") || pathname !== "/") {
        return;
      }

      event.preventDefault();
      scrollToSection(href);
      window.history.replaceState(null, "", href);
    },
    [pathname],
  );

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

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }

    scrollToSection(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    if (!exploreOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!exploreRef.current?.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [exploreOpen]);

  useEffect(() => {
    if (!exploreOpen || !focusFirstItemRef.current) {
      return;
    }

    focusFirstItemRef.current = false;
    requestAnimationFrame(() => {
      exploreMenuRef.current
        ?.querySelector<HTMLAnchorElement>("[data-explore-item]")
        ?.focus();
    });
  }, [exploreOpen]);

  const handleExploreButtonKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();
    if (!exploreOpen) {
      focusFirstItemRef.current = true;
      setExploreOpen(true);
      return;
    }

    exploreMenuRef.current
      ?.querySelector<HTMLAnchorElement>("[data-explore-item]")
      ?.focus();
  };

  const handleExploreKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !exploreOpen) {
      return;
    }

    event.stopPropagation();
    setExploreOpen(false);
    exploreButtonRef.current?.focus();
  };

  const handleExploreBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!exploreRef.current?.contains(event.relatedTarget as Node)) {
      setExploreOpen(false);
    }
  };

  const handleExploreMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLUListElement>,
  ) => {
    const items = Array.from(
      exploreMenuRef.current?.querySelectorAll<HTMLAnchorElement>(
        "[data-explore-item]",
      ) ?? [],
    );

    if (items.length === 0) {
      return;
    }

    const currentIndex = items.findIndex(
      (item) => item === document.activeElement,
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

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

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                ref={exploreRef}
                className="relative"
                onKeyDown={handleExploreKeyDown}
                onBlur={handleExploreBlur}
              >
                <button
                  ref={exploreButtonRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={exploreOpen}
                  aria-controls="explore-menu"
                  onClick={() => setExploreOpen((value) => !value)}
                  onKeyDown={handleExploreButtonKeyDown}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    exploreOpen
                      ? "bg-surface-raised text-foreground"
                      : "text-subtle hover:bg-surface-raised hover:text-foreground",
                  )}
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 transition-transform duration-200",
                      exploreOpen && "rotate-180",
                    )}
                  />
                </button>

                {exploreOpen ? (
                  <ul
                    ref={exploreMenuRef}
                    id="explore-menu"
                    role="menu"
                    aria-label="Explore"
                    onKeyDown={handleExploreMenuKeyDown}
                    className="absolute top-full left-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-surface-card p-1.5 shadow-card"
                  >
                    {item.children.map((link) => (
                      <li key={link.label} role="none">
                        <Link
                          role="menuitem"
                          data-explore-item
                          href={link.href}
                          onClick={(event) => {
                            handleHashClick(event, link.href);
                            setExploreOpen(false);
                          }}
                          className={menuItemClass}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                onClick={(event) => handleHashClick(event, item.href ?? "")}
                className={navLinkClass}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {isResolving ? (
            <span className="h-10 w-32 animate-pulse rounded-xl bg-surface-raised" />
          ) : status === "authenticated" ? (
            <>
              <ButtonLink
                href="/dashboard"
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                {accountLabel(user)}
              </ButtonLink>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
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

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="secondary"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-surface px-4 py-5 shadow-2xl lg:hidden"
      >
        <Container className="flex flex-col gap-2">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  type="button"
                  aria-expanded={mobileExploreOpen}
                  aria-controls="mobile-explore-menu"
                  onClick={() => setMobileExploreOpen((value) => !value)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-subtle transition-colors hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 transition-transform duration-200",
                      mobileExploreOpen && "rotate-180",
                    )}
                  />
                </button>

                {mobileExploreOpen ? (
                  <div
                    id="mobile-explore-menu"
                    className="mt-1 flex flex-col gap-1 border-l-2 border-border pl-3"
                  >
                    {item.children.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={(event) => {
                          handleHashClick(event, link.href);
                          closeMenu();
                        }}
                        className={navLinkClass}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                onClick={(event) => {
                  handleHashClick(event, item.href ?? "");
                  closeMenu();
                }}
                className={navLinkClass}
              >
                {item.label}
              </Link>
            ),
          )}

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
