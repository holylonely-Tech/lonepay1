import type { Metadata } from "next";

import { HowItWorksPage } from "@/components/how-it-works-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "How It Works — LonePay",
  description:
    "Learn how LonePay accounts and wallet information work, and see exactly what is available today.",
};

export default function HowItWorksPageRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <HowItWorksPage />
      </main>
      <SiteFooter />
    </div>
  );
}
