"use client";

import { BadgeCheck, LifeBuoy, Mail, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { contactInfo } from "@/lib/site";

const memberSinceFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
});

function memberSince(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : memberSinceFormatter.format(date);
}

export function AccountSummary() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section
      aria-labelledby="account-summary-heading"
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="rounded-2xl border border-border bg-surface-card p-6">
        <h2
          id="account-summary-heading"
          className="text-base font-semibold text-foreground"
        >
          Account summary
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-bold text-primary"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-sm text-subtle">{user.email}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-subtle">Email status</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              {user.email_verified ? (
                <>
                  <BadgeCheck
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-foreground">Verified</span>
                </>
              ) : (
                <>
                  <ShieldAlert
                    className="size-4 text-warning"
                    aria-hidden="true"
                  />
                  <Link
                    href="/verify-email"
                    className="text-primary hover:underline"
                  >
                    Verify now
                  </Link>
                </>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-subtle">Member since</dt>
            <dd className="font-medium text-foreground">
              {memberSince(user.created_at)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-surface-card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <LifeBuoy className="size-4 text-primary" aria-hidden="true" />
          Need help?
        </h2>
        <p className="mt-2 text-sm text-subtle">
          Reach the LonePay support team if you have questions about your
          account or a transaction.
        </p>

        <ul className="mt-4 space-y-3 text-sm">
          <li>
            <a
              href={`tel:${contactInfo.supportPhone}`}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-foreground transition-colors hover:border-primary/40 hover:bg-surface-raised"
            >
              <Phone className="size-4 text-primary" aria-hidden="true" />
              <span className="font-medium">{contactInfo.supportPhone}</span>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${contactInfo.supportEmail}`}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-foreground transition-colors hover:border-primary/40 hover:bg-surface-raised"
            >
              <Mail className="size-4 text-primary" aria-hidden="true" />
              <span className="truncate font-medium">
                {contactInfo.supportEmail}
              </span>
            </a>
          </li>
        </ul>

        <div className="mt-4">
          <ButtonLink href="/contact" variant="secondary" size="sm">
            Visit help center
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
