import type { Metadata } from "next";

import { WalletSection } from "@/components/wallet/wallet-section";

export const metadata: Metadata = {
  title: "Transactions — LonePay",
  description: "Your LonePay wallet balance and full transaction history.",
};

export default function TransactionsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Wallet &amp; transactions
        </h1>
        <p className="mt-1 text-sm text-subtle">
          Review your wallet balance and browse your full transaction history.
        </p>
      </header>

      <WalletSection />
    </div>
  );
}
