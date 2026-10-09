import Image from "next/image";
import { Lock, Receipt, RefreshCcw, Route, Shield } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/section";
import { trustHighlights } from "@/lib/site";

const featureIcons = [Route, RefreshCcw, Receipt, Lock] as const;

function InfrastructureFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: (typeof featureIcons)[number];
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-accent">
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-subtle">
          {description}
        </p>
      </div>
    </li>
  );
}

export function TrustSection() {
  return (
    <Section
      id="security"
      className="bg-surface-sunken border-y border-border sm:py-24"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[11fr_9fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Infrastructure"
              title="Infrastructure built to prevent stuck transactions"
              description="We know how frustrating it is when money leaves your account and your transaction doesn't arrive. LonePay was designed from the ground up to solve that."
              align="left"
            />

            <ul className="mt-10 space-y-4">
              {trustHighlights.map((item, index) => {
                const Icon = featureIcons[index] ?? Shield;

                return (
                  <InfrastructureFeature
                    key={item.title}
                    icon={Icon}
                    title={item.title}
                    description={item.description}
                  />
                );
              })}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-start">
            <Image
              src="/images/transaction-security-illustration.png"
              alt="Illustration of two people reviewing financial information."
              width={501}
              height={378}
              unoptimized
              className="h-auto w-full max-w-sm rounded-2xl sm:max-w-md lg:max-w-none"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
