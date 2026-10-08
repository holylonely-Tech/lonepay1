import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-artwork relative isolate overflow-hidden"
    >
      {/* Readability veil, localised to the copy column so the right-hand
          subject in the artwork stays completely clear. */}
      <div
        aria-hidden="true"
        className="hero-veil pointer-events-none absolute inset-0 -z-10"
      />

      <Container className="flex min-h-[560px] items-center py-16 sm:min-h-[580px] sm:py-20 lg:min-h-[620px] lg:py-24">
        <div className="flex max-w-xl flex-col items-start gap-6 lg:max-w-[34rem]">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-foreground uppercase">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-primary"
            />
            Direct Nigerian Gateway · Zero Gateway Delay
          </p>

          <h1
            id="hero-heading"
            className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.15]"
          >
            Pay bills and recharge <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-strong">
              without the stress.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-subtle sm:text-lg">
            Direct connections to MTN, Airtel, Glo, 9mobile, all electricity
            DisCos, and major billers across Nigeria. Instant token delivery and
            zero hidden charges.
          </p>

          {/* Quick value badges */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-subtle">
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              Instant 20-digit STS tokens
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              Up to 2.5% airtime cashback
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              Automated virtual accounts
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center">
            <ButtonLink href="/register" size="lg" className="w-full sm:w-auto">
              Get started free
              <ChevronRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="#services"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore services
            </ButtonLink>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs text-subtle">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            <span>
              Regulated Nigerian banking rails & instant automated refunds
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
