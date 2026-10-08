import {
  CheckCircle2,
  Lock,
  Receipt,
  RefreshCcw,
  Route,
  Shield,
} from "lucide-react";

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

type TransactionStatusCardProps = {
  status: string;
  reference: string;
  service: string;
  customer: string;
  amount: string;
  fee: string;
  delivery: string;
  completed: string;
  internalRef: string;
};

function TransactionStatusCard({
  status,
  reference,
  service,
  customer,
  amount,
  fee,
  delivery,
  completed,
  internalRef,
}: TransactionStatusCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border-strong bg-surface-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
              <CheckCircle2 className="size-5" />
            </span>
            <p className="text-sm font-bold text-foreground">
              Transaction Successful
            </p>
          </div>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            {status}
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-primary/30 bg-accent-panel p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Transaction Reference
          </p>
          <p className="mt-2 break-words font-mono text-lg font-bold tracking-wide text-foreground sm:text-xl">
            {reference}
          </p>
          <p className="mt-1.5 text-xs text-on-accent-panel">{service}</p>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-b border-border pb-4">
          <span className="text-sm text-muted">Amount Paid</span>
          <span className="text-xl font-bold text-foreground">{amount}</span>
        </div>

        <dl className="mt-2">
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-muted">Customer</dt>
            <dd className="text-sm font-semibold text-foreground">
              {customer}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border/70 py-3">
            <dt className="text-sm text-muted">Transaction Fee</dt>
            <dd className="text-sm font-semibold text-foreground">{fee}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border/70 py-3">
            <dt className="text-sm text-muted">Delivery Status</dt>
            <dd className="text-sm font-semibold text-accent">
              {delivery} · {completed}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border/70 py-3">
            <dt className="text-sm text-muted">Internal Ref</dt>
            <dd className="font-mono text-sm font-semibold text-foreground">
              {internalRef}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
          <span>SMS confirmation dispatched</span>
          <span className="font-semibold text-foreground">
            Saved to receipts
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Demo transaction — for illustration.
      </p>
    </div>
  );
}

const demoTransaction = {
  status: "Completed",
  reference: "4820 • 9184 • 5582 • 0194 • 3829",
  service: "Prepaid Electricity · Ikeja Electric (IKEDC)",
  customer: "LonePay User",
  amount: "₦5,000.00",
  fee: "₦0.00",
  delivery: "Delivered",
  completed: "Just now",
  internalRef: "LNP-5A83K2",
} as const;

export function TrustSection() {
  return (
    <Section
      id="security"
      className="bg-surface-sunken border-y border-border sm:py-24"
    >
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Infrastructure"
              title="Infrastructure built to prevent stuck transactions"
              description="We know how frustrating it is when money leaves your account and your transaction doesn't arrive. LonePay was designed from the ground up to solve that."
              align="left"
            />
          </div>

          <TransactionStatusCard {...demoTransaction} />

          <ul className="space-y-4">
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
      </Container>
    </Section>
  );
}
