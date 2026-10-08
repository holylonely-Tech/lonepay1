import type { Metadata } from "next";

import { ContactPageSection } from "@/components/contact-page-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Contact Us — LonePay",
  description:
    "Get in touch with LonePay for help with airtime, data bundles, electricity tokens, cable TV subscriptions, wallet funding, and other supported services. We reply by email.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <ContactPageSection />
      </main>
      <SiteFooter />
    </div>
  );
}
