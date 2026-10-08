import Link from "next/link";

import { Container } from "@/components/ui/section";
import { Logo } from "@/components/ui/logo";
import { footerSections } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-raised pt-14 pb-8 sm:pt-16 sm:pb-10">
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-10">
          <div className="flex flex-col items-start gap-4">
            <Link href="/" aria-label="LonePay Home">
              <Logo size="md" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-subtle">
              LonePay is a modern Nigerian digital payment and VTU platform
              providing instant airtime, data bundles, electricity tokens, cable
              TV subscriptions, and examination PINs.
            </p>
          </div>

          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-subtle transition-colors hover:text-accent focus-visible:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:pt-6">
          <p>© {new Date().getFullYear()} LonePay. All rights reserved.</p>
          <p>Built for everyday payments in Nigeria.</p>
        </div>
      </Container>
    </footer>
  );
}
