import Image from "next/image";

import { Container, Section, SectionHeading } from "@/components/ui/section";
import {
  cableProviders,
  electricityDiscos,
  examProviders,
  telcoProviders,
} from "@/lib/site";
import { cn } from "@/lib/utils";

function GroupHeader({ label, note }: { label: string; note?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
        {label}
      </h3>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      {note ? (
        <span className="text-xs font-medium text-muted">{note}</span>
      ) : null}
    </div>
  );
}

type ProviderCardProps = {
  name: string;
  description: string;
  detail?: string;
  status?: string;
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
  mark?: string;
  markClass?: string;
};

function ProviderCard({
  name,
  description,
  detail,
  status,
  logo,
  logoWidth,
  logoHeight,
  mark,
  markClass,
}: ProviderCardProps) {
  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface-card p-4">
      {logo ? (
        <Image
          src={logo}
          alt={`${name} logo`}
          width={logoWidth}
          height={logoHeight}
          unoptimized
          className="mb-3 h-9 w-auto max-w-full object-contain"
        />
      ) : mark ? (
        <span
          aria-hidden="true"
          className={cn(
            "mb-3 grid size-9 place-items-center rounded-lg text-xs font-bold tracking-wide uppercase",
            markClass,
          )}
        >
          {mark}
        </span>
      ) : null}

      <p className="text-base font-semibold leading-snug text-foreground">
        {name}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-subtle">{description}</p>
      {detail ? (
        <p className="mt-1 text-xs leading-snug text-muted">{detail}</p>
      ) : null}

      {status ? (
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-accent">
            {status}
          </span>
        </div>
      ) : null}
    </li>
  );
}

function ProviderList({
  title,
  items,
}: {
  title: string;
  items: { name: string; detail: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-card p-5">
      <GroupHeader label={title} />
      <dl className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
          >
            <dt className="text-sm font-semibold text-foreground">
              {item.name}
            </dt>
            <dd className="text-[13px] leading-snug text-subtle">
              {item.detail}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ProvidersGrid() {
  return (
    <Section
      id="providers"
      className="bg-surface-sunken border-y border-border"
    >
      <Container>
        <SectionHeading
          eyebrow="Coverage & Integrations"
          title="Direct integration across Nigeria"
          description="We route transactions directly to authorized telecom aggregators, electricity distributors and payment service providers."
          align="center"
        />

        <div className="mt-12 space-y-10">
          {/* Telecom / network operators */}
          <div>
            <GroupHeader
              label="Telecom / Network Operators"
              note="Supported networks"
            />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {telcoProviders.map((telco) => (
                <ProviderCard
                  key={telco.code}
                  logo={telco.logo}
                  logoWidth={telco.logoWidth}
                  logoHeight={telco.logoHeight}
                  mark={telco.mark}
                  markClass={telco.markClass}
                  name={telco.name}
                  description={telco.category}
                  status={telco.status}
                />
              ))}
            </ul>
          </div>

          {/* Electricity distribution companies */}
          <div>
            <GroupHeader
              label="Electricity Distribution Companies"
              note="Prepaid & postpaid supported"
            />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {electricityDiscos.map((disco) => (
                <ProviderCard
                  key={disco.short}
                  name={disco.short}
                  description={disco.name}
                  detail={disco.state}
                  status={disco.status}
                />
              ))}
            </ul>
          </div>

          {/* Cable TV + examination providers */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProviderList
              title="Cable TV Providers"
              items={cableProviders.map((cable) => ({
                name: cable.name,
                detail: cable.packages,
              }))}
            />
            <ProviderList
              title="Examination Service Providers"
              items={examProviders.map((exam) => ({
                name: exam.name,
                detail: exam.desc,
              }))}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
