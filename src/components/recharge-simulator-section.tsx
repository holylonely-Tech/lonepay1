import { RechargeSimulator } from "@/components/recharge-simulator";
import { Container, Section } from "@/components/ui/section";

export function RechargeSimulatorSection() {
  return (
    <Section id="recharge-calculator" className="bg-background pt-0 sm:pt-0">
      <Container>
        <RechargeSimulator />
      </Container>
    </Section>
  );
}
