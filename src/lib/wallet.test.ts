import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "@/lib/api";
import {
  fetchWallet,
  fetchWalletTransactions,
  formatNaira,
} from "@/lib/wallet";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("formatNaira", () => {
  it("formats a decimal string as Nigerian Naira", () => {
    expect(formatNaira("1234.56")).toContain("1,234.56");
    expect(formatNaira("1234.56")).toContain("₦");
  });

  it("always renders two decimal places", () => {
    expect(formatNaira("0")).toContain("0.00");
    expect(formatNaira("1500")).toContain("1,500.00");
  });
});

describe("fetchWallet", () => {
  it("requests the authenticated wallet and unwraps the data envelope", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: {
        id: 1,
        currency: "NGN",
        balance: "1500.50",
        status: "active",
        updated_at: null,
      },
    });

    const wallet = await fetchWallet();

    expect(apiRequest).toHaveBeenCalledWith("/api/wallet");
    expect(wallet.balance).toBe("1500.50");
    expect(wallet.currency).toBe("NGN");
  });
});

describe("fetchWalletTransactions", () => {
  it("requests a page of history with pagination parameters", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: [],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 2,
        last_page: 3,
        per_page: 10,
        total: 25,
        from: 11,
        to: 20,
      },
    });

    const result = await fetchWalletTransactions(2, 10);

    expect(apiRequest).toHaveBeenCalledWith(
      "/api/wallet/transactions?page=2&per_page=10",
    );
    expect(result.meta.total).toBe(25);
  });
});
