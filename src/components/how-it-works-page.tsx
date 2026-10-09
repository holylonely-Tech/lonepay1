import { Activity, Info, UserPlus, Wallet } from "lucide-react";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Register with your name, email, and password. Sign in to access your account.",
  },
  {
    step: "02",
    icon: Wallet,
    title: "View your wallet",
    description:
      "Check your persisted NGN wallet balance and review your transaction history. Live wallet funding is not available yet.",
  },
  {
    step: "03",
    icon: Activity,
    title: "Track your account activity",
    description:
      "Review the transaction records currently available to the account. Live airtime, data, and bill purchases are not yet enabled.",
  },
] as const;

const availabilityStatement =
  "Account registration and sign-in pages, authenticated dashboard access, persisted NGN wallet information, and paginated transaction history have been implemented. Email delivery depends on mail-provider configuration. Deposits, withdrawals, transfers, payment gateways, and live VTU purchases are not yet implemented.";

export function HowItWorksPage() {
  return (
    <>
      <Section className="bg-background pb-8 sm:pb-12">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SectionHeading
                as="h1"
                align="left"
                eyebrow="How LonePay Works"
                title="Your account. Your transactions. One place."
                description="Manage your LonePay account and view your wallet information in one simple dashboard."
              />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/register"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Create an account
                </ButtonLink>
                <ButtonLink
                  href="/login"
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Sign in
                </ButtonLink>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Image
                src="/images/how-it-works-financial-illustration.jpg"
                alt="Illustration of people reviewing financial charts and account information."
                width={2916}
                height={2916}
                unoptimized
                className="h-auto w-full max-w-md rounded-2xl sm:max-w-lg lg:max-w-none"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-background pt-4 sm:pt-6">
        <Container>
          <SectionHeading
            eyebrow="Three Steps"
            title="What you can do today"
            description="A short, straightforward walkthrough of the account and wallet experience that is currently available."
          />

          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map(({ step, icon: Icon, title, description }) => (
              <li
                key={step}
                className="relative flex flex-col rounded-2xl border border-border bg-surface-card p-6 transition-all duration-200 ease-out hover:border-primary/40 hover:bg-surface-raised hover:shadow-card motion-reduce:transition-none"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-[13px] font-bold text-accent">
                  {step}
                </span>

                <span className="mt-5 flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                  <Icon className="size-6" aria-hidden="true" />
                </span>

                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-subtle">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-t border-border bg-surface-sunken">
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
                What is available today?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-subtle sm:text-base">
                {availabilityStatement}
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
