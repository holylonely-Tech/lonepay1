import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "@/components/ui/section";
import { Logo } from "@/components/ui/logo";

type AuthShellProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" aria-label="LonePay Home" className="shrink-0">
            <Logo size="md" />
          </Link>
          <ThemeToggle />
        </Container>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border-strong bg-surface-card p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-subtle">
                {description}
              </p>
            ) : null}

            <div className="mt-6">{children}</div>
          </div>

          {footer ? (
            <div className="mt-5 text-center text-sm text-subtle">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
