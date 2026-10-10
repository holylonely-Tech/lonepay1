"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { AccountSummary } from "@/components/dashboard/account-summary";
import { QuickServices } from "@/components/dashboard/quick-services";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletBalanceCard } from "@/components/dashboard/wallet-balance-card";

function greetingName(name: string | undefined): string {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName || "there";
}

export function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {greetingName(user?.name)}
        </h1>
        <p className="mt-1 text-sm text-subtle">
          Here is an overview of your LonePay wallet and account.
        </p>
      </header>

      <WalletBalanceCard />

      <QuickServices />

      <RecentTransactions />

      <AccountSummary />
    </div>
  );
}
