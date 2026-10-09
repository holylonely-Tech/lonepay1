import type { Metadata } from "next";

import { ProvidersPage } from "@/components/providers-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Providers — LonePay",
  description:
    "Browse the mobile networks, electricity distribution companies, cable TV, and examination service providers LonePay lists.",
};

export default function ProvidersRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <ProvidersPage />
      </main>
      <SiteFooter />
    </div>
  );
}
