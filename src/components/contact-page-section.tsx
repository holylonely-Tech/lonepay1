import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { contactInfo, socialChannels } from "@/lib/site";

const socialIcons = {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} as const;

export function ContactPageSection() {
  return (
    <Section
      aria-label="Contact LonePay"
      className="bg-background py-16 sm:py-24"
    >
      <Container>
        <SectionHeading
          align="left"
          as="h1"
          headingId="contact-page-heading"
          eyebrow="Contact Us"
          title="Have a question? We're here to help."
          description="Get in touch with LonePay for assistance with airtime, data, electricity payments, cable TV, wallet funding, and other supported services."
        />

        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <ContactForm />

          <aside
            aria-labelledby="contact-info-heading"
            className="rounded-2xl border border-border bg-surface-card p-5 sm:p-7"
          >
            <h2 id="contact-info-heading" className="sr-only">
              Contact information
            </h2>

            <div className="divide-y divide-border">
              <div className="flex items-start gap-4 py-5 first:pt-0">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface text-accent"
                >
                  <Phone className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                    Call us
                  </p>
                  <a
                    href={`tel:${contactInfo.supportPhone}`}
                    className="mt-1 block text-base font-semibold text-foreground underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
                  >
                    {contactInfo.supportPhone}
                  </a>
                  <p className="mt-1 text-sm text-subtle">
                    For help with airtime, data, electricity, cable TV, and
                    wallet questions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-5">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface text-accent"
                >
                  <Mail className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                    Email
                  </p>
                  <a
                    href={`mailto:${contactInfo.supportEmail}`}
                    className="mt-1 block break-all text-base font-semibold text-foreground underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
                  >
                    {contactInfo.supportEmail}
                  </a>
                  <p className="mt-1 text-sm text-subtle">
                    Send transaction IDs, receipts, or account questions here.
                  </p>
                </div>
              </div>

              {socialChannels.length > 0 && (
                <div className="py-5 last:pb-0">
                  <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                    Follow us
                  </p>
                  <ul className="mt-3 flex items-center gap-2.5">
                    {socialChannels.map((channel) => {
                      const Icon = socialIcons[channel.icon];
                      if (!Icon) {
                        return null;
                      }
                      return (
                        <li key={channel.label}>
                          <a
                            href={channel.href}
                            aria-label={channel.label}
                            className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-subtle transition-colors duration-150 hover:border-primary/50 hover:bg-primary/10 hover:text-accent"
                          >
                            <Icon className="size-5" aria-hidden="true" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
