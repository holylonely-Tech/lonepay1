import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wallet")>();
  return {
    ...actual,
    fetchWallet: vi.fn(),
    fetchWalletTransactions: vi.fn(),
  };
});

import { WalletSection } from "@/components/wallet/wallet-section";
import {
  fetchWallet,
  fetchWalletTransactions,
  type PaginatedTransactions,
  type WalletSummary,
  type WalletTransaction,
} from "@/lib/wallet";

const wallet: WalletSummary = {
  id: 1,
  currency: "NGN",
  balance: "1234.56",
  status: "active",
  updated_at: "2026-10-01T10:00:00+00:00",
};

const credit: WalletTransaction = {
  id: 1,
  reference: "TXN-20261001-AAAA",
  type: "funding",
  status: "successful",
  direction: "credit",
  amount: "1234.56",
  fee: "0.00",
  total: "1234.56",
  currency: "NGN",
  description: null,
  provider_reference: null,
  created_at: "2026-10-01T10:00:00+00:00",
};

const debit: WalletTransaction = {
  id: 2,
  reference: "TXN-20261002-BBBB",
  type: "airtime",
  status: "successful",
  direction: "debit",
  amount: "100.00",
  fee: "0.00",
  total: "100.00",
  currency: "NGN",
  description: null,
  provider_reference: null,
  created_at: "2026-10-02T10:00:00+00:00",
};

function history(
  data: WalletTransaction[],
  meta: Partial<PaginatedTransactions["meta"]> = {},
): PaginatedTransactions {
  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: data.length,
      from: data.length > 0 ? 1 : null,
      to: data.length > 0 ? data.length : null,
      ...meta,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("WalletSection", () => {
  it("shows the persisted balance and the transaction list", async () => {
    vi.mocked(fetchWallet).mockResolvedValue(wallet);
    vi.mocked(fetchWalletTransactions).mockResolvedValue(
      history([credit, debit]),
    );

    render(<WalletSection />);

    const amounts = await screen.findAllByText(/1,234\.56/);
    expect(amounts.length).toBeGreaterThan(0);
    expect(screen.getByText("Wallet funding")).toBeInTheDocument();
    expect(screen.getByText("Airtime")).toBeInTheDocument();
    expect(screen.getByText(/\+₦1,234\.56/)).toBeInTheDocument();
    expect(screen.getByText(/−₦100\.00/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no transactions", async () => {
    vi.mocked(fetchWallet).mockResolvedValue({ ...wallet, balance: "0.00" });
    vi.mocked(fetchWalletTransactions).mockResolvedValue(history([]));

    render(<WalletSection />);

    expect(await screen.findByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it("shows an honest error and retries on demand", async () => {
    vi.mocked(fetchWallet)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(wallet);
    vi.mocked(fetchWalletTransactions)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(history([credit]));

    render(<WalletSection />);

    expect(
      await screen.findByText(/could not load your wallet/i),
    ).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("Wallet funding")).toBeInTheDocument();
    expect(screen.queryByText(/could not load your wallet/i)).toBeNull();
  });

  it("pages through history using the API metadata", async () => {
    vi.mocked(fetchWallet).mockResolvedValue(wallet);
    vi.mocked(fetchWalletTransactions).mockImplementation(async (page = 1) =>
      page === 1
        ? history([credit], {
            current_page: 1,
            last_page: 2,
            total: 2,
          })
        : history([debit], {
            current_page: 2,
            last_page: 2,
            total: 2,
          }),
    );

    render(<WalletSection />);

    expect(await screen.findByText("Wallet funding")).toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText("Airtime")).toBeInTheDocument();
    expect(
      vi
        .mocked(fetchWalletTransactions)
        .mock.calls.some(([page]) => page === 2),
    ).toBe(true);
  });
});
