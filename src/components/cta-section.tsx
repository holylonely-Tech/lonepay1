import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

export function CtaSection() {
  return (
    <div className="border-t border-border bg-surface-sunken py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-surface-card p-8 text-center shadow-card sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_60%)]"
          />

          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-accent">
            <Zap className="size-3.5" />
            Zero Setup Fee · Instant Account Creation
          </span>

          <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to pay bills without the stress?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-subtle sm:text-base">
            Join thousands of smart Nigerians who recharge airtime, buy cheap
            data bundles, and generate electricity tokens on LonePay every day.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg" className="w-full sm:w-auto">
              Create free account
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/login"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Sign in to wallet
            </ButtonLink>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            <span>
              Dedicated virtual account generated automatically upon signup
            </span>
          </div>
        </div>
      </Container>
    </div>
  );
}
