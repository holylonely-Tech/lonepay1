import { AccountActivitySection } from "@/components/account-activity-section";
import { CoreServices } from "@/components/core-services";

export function ServicesPage() {
  return (
    <>
      <CoreServices headingAs="h1" className="pt-10 sm:pt-16" />

      <AccountActivitySection />
    </>
  );
}
