import { ArrowRight, History, LogIn, Wallet } from "lucide-react";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";

const accountActivityPoints = [
  {
    icon: Wallet,
    title: "Your wallet at a glance",
    description: "View your persisted NGN wallet balance and wallet status.",
  },
  {
    icon: History,
    title: "Transaction history",
    description: "Browse your account's transaction records with pagination.",
  },
  {
    icon: LogIn,
    title: "Account access",
    description:
      "Sign in to return to your dashboard and review your account information.",
  },
] as const;

export function AccountActivitySection() {
  return (
    <Section className="border-t border-border bg-accent-panel">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Your account, made simple"
              title="Keep track of your account activity"
              description="Use your LonePay dashboard to review your wallet balance and browse the transaction records available to your account, all in one place."
            />

            <ul className="mt-8 flex flex-col gap-4">
              {accountActivityPoints.map(
                ({ icon: Icon, title, description }) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-surface-card p-5"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-subtle">
                        {description}
                      </p>
                    </div>
                  </li>
                ),
              )}
            </ul>

            <div className="mt-8">
              <ButtonLink href="/dashboard" variant="secondary" size="lg">
                Go to your dashboard
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Image
              src="/images/account-activity-illustration.jpg"
              alt="Illustration of a person managing finances on a laptop."
              width={1176}
              height={979}
              unoptimized
              className="h-auto w-full max-w-md rounded-2xl sm:max-w-lg lg:max-w-none"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
