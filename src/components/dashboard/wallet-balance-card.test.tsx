import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wallet")>();
  return {
    ...actual,
    fetchWallet: vi.fn(),
  };
});

import { WalletBalanceCard } from "@/components/dashboard/wallet-balance-card";
import { fetchWallet, type WalletSummary } from "@/lib/wallet";

const wallet: WalletSummary = {
  id: 1,
  currency: "NGN",
  balance: "1234.56",
  status: "active",
  updated_at: "2026-10-01T10:00:00+00:00",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("WalletBalanceCard", () => {
  it("shows the persisted balance and can hide it", async () => {
    vi.mocked(fetchWallet).mockResolvedValue(wallet);

    render(<WalletBalanceCard />);

    expect(await screen.findByText(/1,234\.56/)).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /hide balance/i }));

    expect(screen.getByText("₦••••••")).toBeInTheDocument();
    expect(screen.queryByText(/1,234\.56/)).toBeNull();
  });

  it("shows an honest error and retries on demand", async () => {
    vi.mocked(fetchWallet)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(wallet);

    render(<WalletBalanceCard />);

    expect(
      await screen.findByText(/could not load your wallet balance/i),
    ).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText(/1,234\.56/)).toBeInTheDocument();
    expect(
      screen.queryByText(/could not load your wallet balance/i),
    ).toBeNull();
  });
});
