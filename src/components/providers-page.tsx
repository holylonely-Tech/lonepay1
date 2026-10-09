import { Info } from "lucide-react";

import { ProvidersGrid } from "@/components/providers-grid";
import { Container, Section, SectionHeading } from "@/components/ui/section";

export function ProvidersPage() {
  return (
    <>
      <Section className="bg-background pb-8 sm:pb-12">
        <Container>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Providers"
            title="Providers and coverage"
            description="Browse the mobile networks, electricity distribution companies, cable TV, and examination services LonePay lists for Nigerian bill payments."
          />
        </Container>
      </Section>

      <ProvidersGrid />

      <Section className="bg-background">
        <Container>
          <div className="mx-auto flex max-w-3xl items-start gap-4 rounded-3xl border border-border bg-surface-card p-6 shadow-card sm:gap-5 sm:p-8">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"
            >
              <Info className="size-5" />
            </span>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                Listed options vs. confirmed integrations
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-subtle sm:text-base">
                The providers on this page are the options LonePay presents for
                mobile networks, electricity, cable TV, and examination PINs.
                Live integrations and purchases for these services are not
                enabled yet. At the moment, only account registration, sign-in,
                dashboard access, and read-only wallet information are
                implemented.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
