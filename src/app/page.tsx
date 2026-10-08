import { ContactSection } from "@/components/contact-section";
import { CoreServices } from "@/components/core-services";
import { CtaSection } from "@/components/cta-section";
import { FaqSection } from "@/components/faq-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { NetworkStrip } from "@/components/network-strip";
import { ProvidersGrid } from "@/components/providers-grid";
import { RechargeSimulatorSection } from "@/components/recharge-simulator-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrustSection } from "@/components/trust-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <RechargeSimulatorSection />
        <NetworkStrip />
        <CoreServices />
        <ProvidersGrid />
        <HowItWorks />
        <TrustSection />
        <FaqSection />
        <ContactSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
