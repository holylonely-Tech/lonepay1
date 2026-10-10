import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/wallet", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/wallet")>();
  return {
    ...actual,
    fetchWalletTransactions: vi.fn(),
  };
});

import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import {
  fetchWalletTransactions,
  type PaginatedTransactions,
  type WalletTransaction,
} from "@/lib/wallet";

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

function history(data: WalletTransaction[]): PaginatedTransactions {
  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 5,
      total: data.length,
      from: data.length > 0 ? 1 : null,
      to: data.length > 0 ? data.length : null,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("RecentTransactions", () => {
  it("lists the most recent transactions", async () => {
    vi.mocked(fetchWalletTransactions).mockResolvedValue(
      history([credit, debit]),
    );

    render(<RecentTransactions />);

    expect(await screen.findByText("Wallet funding")).toBeInTheDocument();
    expect(screen.getByText("Airtime")).toBeInTheDocument();
    expect(screen.getByText(/\+₦1,234\.56/)).toBeInTheDocument();
    expect(screen.getByText(/−₦100\.00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all/i })).toBeInTheDocument();
  });

  it("shows an empty state when there are no transactions", async () => {
    vi.mocked(fetchWalletTransactions).mockResolvedValue(history([]));

    render(<RecentTransactions />);

    expect(await screen.findByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it("shows an honest error and retries on demand", async () => {
    vi.mocked(fetchWalletTransactions)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(history([credit]));

    render(<RecentTransactions />);

    expect(
      await screen.findByText(/could not load your recent transactions/i),
    ).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("Wallet funding")).toBeInTheDocument();
  });
});
