import {
  CheckCircle,
  ChevronRight,
  Receipt,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/section";
import { workflowSteps } from "@/lib/site";

const stepIcons = [Wallet, Smartphone, Receipt] as const;

function HowItWorksStep({
  step,
  icon: Icon,
  title,
  description,
  isLast,
}: {
  step: string;
  icon: (typeof stepIcons)[number];
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <li className="relative flex flex-col rounded-2xl border border-border bg-surface-card p-6 transition-all duration-200 ease-out hover:border-primary/40 hover:bg-surface-raised hover:shadow-card motion-reduce:transition-none">
      <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-[13px] font-bold text-accent">
        {step}
      </span>

      <span className="relative mt-5 flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-accent">
        <Icon className="size-6" />
        {!isLast ? (
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-full ml-2 hidden -translate-y-1/2 text-border-strong lg:block"
          >
            <ChevronRight className="size-4" />
          </span>
        ) : null}
      </span>

      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-subtle">{description}</p>
    </li>
  );
}

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-background sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Simple Workflow"
          title="How LonePay works"
          description="Three clear steps designed to make every utility payment straightforward, fast, and verifiable."
          align="center"
        />

        <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? CheckCircle;

            return (
              <HowItWorksStep
                key={step.step}
                step={step.step}
                icon={Icon}
                title={step.title}
                description={step.description}
                isLast={index === workflowSteps.length - 1}
              />
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
