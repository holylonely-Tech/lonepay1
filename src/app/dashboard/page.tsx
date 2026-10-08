import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { DashboardPanel } from "@/components/auth/dashboard-panel";

export const metadata: Metadata = {
  title: "Dashboard — LonePay",
  description: "Your LonePay account dashboard.",
};

export default function DashboardPage() {
  return (
    <AuthShell title="Your account">
      <DashboardPanel />
    </AuthShell>
  );
}
