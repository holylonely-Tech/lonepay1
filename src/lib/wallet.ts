import { apiRequest } from "@/lib/api";

/**
 * Wallet API calls and NGN formatting.
 *
 * The Laravel backend is the source of truth for every balance and amount.
 * Values arrive as fixed two-decimal strings and are only parsed to numbers
 * here for display; JavaScript arithmetic is never used for accounting.
 */

export type WalletSummary = {
  id: number;
  currency: string;
  balance: string;
  status: string;
  updated_at: string | null;
};

export type WalletTransactionDirection = "credit" | "debit";

export type WalletTransaction = {
  id: number;
  reference: string;
  type: string;
  status: string;
  direction: WalletTransactionDirection;
  amount: string;
  fee: string;
  total: string;
  currency: string;
  description: string | null;
  provider_reference: string | null;
  created_at: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type PaginatedTransactions = {
  data: WalletTransaction[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
};

/** Fetch the authenticated user's wallet summary. */
export async function fetchWallet(): Promise<WalletSummary> {
  const response = await apiRequest<{ data: WalletSummary }>("/api/wallet");
  return response.data;
}

/** Fetch a page of the authenticated user's wallet transactions. */
export async function fetchWalletTransactions(
  page = 1,
  perPage = 10,
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiRequest<PaginatedTransactions>(
    `/api/wallet/transactions?${params.toString()}`,
  );
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a backend money string as NGN, e.g. "1234.5" -> "₦1,234.50". */
export function formatNaira(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);

  return nairaFormatter.format(Number.isFinite(amount) ? amount : 0);
}
