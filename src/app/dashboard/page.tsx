import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard — LonePay",
  description: "Your LonePay wallet balance, quick services, and account.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
