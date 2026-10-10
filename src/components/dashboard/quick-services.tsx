import {
  ArrowUpRight,
  GraduationCap,
  Smartphone,
  Tv,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { coreServices } from "@/lib/site";

const serviceIcons: Record<string, LucideIcon> = {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  GraduationCap,
  Wallet,
};

export function QuickServices() {
  return (
    <section aria-labelledby="quick-services-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="quick-services-heading"
            className="text-base font-semibold text-foreground"
          >
            Quick services
          </h2>
          <p className="mt-1 text-sm text-subtle">
            Jump to the services LonePay is building for everyday payments.
          </p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {coreServices.map((service) => {
          const Icon = serviceIcons[service.icon] ?? Wallet;

          return (
            <li key={service.id}>
              <Link
                href="/services#services"
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface-card p-4 transition-colors hover:border-primary/40 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-accent transition-colors group-hover:border-primary/30 group-hover:bg-primary/10"
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {service.title}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Learn more
                  <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-muted">
        Purchases are not available from your dashboard yet. Explore what each
        service offers on the Services page.
      </p>
    </section>
  );
}
