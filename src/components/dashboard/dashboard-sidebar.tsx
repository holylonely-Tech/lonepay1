"use client";

import {
  GraduationCap,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  Smartphone,
  Tv,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { useSignOut } from "@/components/auth/use-sign-out";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  prefixMatch?: boolean;
};

const serviceHref = "/services#services";

const serviceItems: NavItem[] = [
  { label: "Airtime Top-up", href: serviceHref, icon: Smartphone },
  { label: "Mobile Data", href: serviceHref, icon: Wifi },
  { label: "Electricity Tokens", href: serviceHref, icon: Zap },
  { label: "Cable TV", href: serviceHref, icon: Tv },
  { label: "Examination PINs", href: serviceHref, icon: GraduationCap },
];

const accountItems: NavItem[] = [
  {
    label: "Transaction History",
    href: "/dashboard/transactions",
    icon: History,
    prefixMatch: true,
  },
  { label: "Help & Support", href: "/contact", icon: LifeBuoy },
];

const linkBase =
  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        linkBase,
        active
          ? "bg-primary-soft text-primary"
          : "text-subtle hover:bg-surface-raised hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-4 text-xs font-semibold tracking-wider text-muted uppercase">
      {children}
    </p>
  );
}

type DashboardSidebarProps = {
  onNavigate?: () => void;
  onClose?: () => void;
};

export function DashboardSidebar({
  onNavigate,
  onClose,
}: DashboardSidebarProps) {
  const { user } = useAuth();
  const { signOut, isSigningOut, error } = useSignOut();
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.prefixMatch
      ? pathname === item.href || pathname.startsWith(`${item.href}/`)
      : pathname === item.href;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <Link
          href="/"
          aria-label="LonePay Home"
          className="shrink-0"
          onClick={onNavigate}
        >
          <Logo size="sm" />
        </Link>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <nav
        aria-label="Dashboard"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        <NavLink
          item={{
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          }}
          active={pathname === "/dashboard"}
          onNavigate={onNavigate}
        />

        <GroupLabel>Services</GroupLabel>
        {serviceItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={false}
            onNavigate={onNavigate}
          />
        ))}

        <GroupLabel>Account</GroupLabel>
        {accountItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={isActive(item)}
            onNavigate={onNavigate}
          />
        ))}

        <div
          className={cn(linkBase, "cursor-not-allowed text-muted opacity-70")}
        >
          <Settings className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Account Settings</span>
          <span className="ml-auto rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-semibold text-muted">
            Soon
          </span>
        </div>
      </nav>

      <div className="space-y-3 border-t border-border px-3 py-4">
        {user ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary"
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={signOut}
            disabled={isSigningOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Button>
          <ThemeToggle />
        </div>

        {error ? (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
