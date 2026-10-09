import type { Metadata } from "next";

import { ServicesPage } from "@/components/services-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Services — LonePay",
  description:
    "Explore the airtime, data, electricity, cable TV, and examination PIN services LonePay presents, and how your account keeps track of them.",
};

export default function ServicesRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <ServicesPage />
      </main>
      <SiteFooter />
    </div>
  );
}
