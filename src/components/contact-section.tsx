import { Mail, MapPin, Phone } from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/section";
import { contactInfo } from "@/lib/site";

const contactChannels = [
  {
    id: "phone",
    label: "Phone",
    icon: Phone,
    value: contactInfo.supportPhone,
    href: `tel:${contactInfo.supportPhone}`,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    value: contactInfo.supportEmail,
    href: `mailto:${contactInfo.supportEmail}`,
  },
  {
    id: "location",
    label: "Location",
    icon: MapPin,
    value: "Nigeria",
    href: null,
  },
] as const;

export function ContactSection() {
  return (
    <Section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-background"
    >
      <Container>
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <SectionHeading
            align="left"
            headingId="contact-heading"
            eyebrow="Contact Us"
            title="Get in touch with LonePay"
            description="Have a question about your account or payment? Reach us through the contact details below."
          />

          <aside className="rounded-3xl border border-border bg-surface-card p-6 shadow-card sm:p-8">
            <h3 className="text-base font-semibold text-foreground sm:text-lg">
              Contact details
            </h3>

            <ul className="mt-5 divide-y divide-border">
              {contactChannels.map(({ id, label, icon: Icon, value, href }) => (
                <li
                  key={id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface text-accent"
                  >
                    <Icon className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block break-all text-base font-semibold text-foreground underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline focus-visible:text-accent"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {value}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
