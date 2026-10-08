import {
  ArrowRight,
  GraduationCap,
  Smartphone,
  Tv,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Container, Section, SectionHeading } from "@/components/ui/section";
import { coreServices } from "@/lib/site";

type CoreService = (typeof coreServices)[number];

const serviceIcons = {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  GraduationCap,
  Wallet,
} as const;

function ServiceCard({
  service,
  index,
}: {
  service: CoreService;
  index: number;
}) {
  const Icon = serviceIcons[service.icon];
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface-card p-6 transition-all duration-200 ease-out hover:border-primary/40 hover:bg-surface-raised hover:shadow-card motion-reduce:transition-none">
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-xl border border-border bg-surface transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-primary/10 motion-reduce:transition-none">
            <Icon className="size-6 text-accent" />
          </span>
          <span
            aria-hidden="true"
            className="text-[13px] font-semibold tabular-nums text-muted"
          >
            {number}
          </span>
        </div>

        <h3 className="mt-5 text-lg font-semibold text-foreground">
          {service.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-subtle">
          {service.description}
        </p>

        <p className="mt-4 text-[13px] font-medium text-muted">
          {service.metadata}
        </p>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <Link
          href={service.route}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-150 group-hover:text-accent-hover motion-reduce:transition-none"
        >
          {service.action}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </div>
    </div>
  );
}

export function CoreServices() {
  return (
    <Section id="services" className="bg-background sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Supported Billers & Utilities"
          title="Designed for everyday Nigerian payments"
          description="Everything you need to stay connected and powered up, backed by direct telecom and utility connections."
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coreServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
