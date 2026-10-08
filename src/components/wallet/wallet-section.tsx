"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Wallet as WalletIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { FormAlert } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchWallet,
  fetchWalletTransactions,
  formatNaira,
  type PaginatedTransactions,
  type WalletSummary,
  type WalletTransaction,
} from "@/lib/wallet";

const PER_PAGE = 10;

const TYPE_LABELS: Record<string, string> = {
  funding: "Wallet funding",
  airtime: "Airtime",
  data: "Mobile data",
  electricity: "Electricity",
  cable_tv: "Cable TV",
  exam_pin: "Examination pin",
  transfer: "Transfer",
  refund: "Refund",
  fee: "Fee",
  reversal: "Reversal",
};

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
});

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : dateFormatter.format(date);
}

type Status = "loading" | "ready" | "error";

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.direction === "credit";

  return (
    <li className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full",
            isCredit
              ? "bg-primary-soft text-primary"
              : "bg-surface text-subtle",
          )}
        >
          {isCredit ? (
            <ArrowDownLeft className="size-4" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {typeLabel(transaction.type)}
          </p>
          <p className="truncate text-xs text-muted">
            {formatDate(transaction.created_at)} · {transaction.reference}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold",
            isCredit ? "text-primary" : "text-foreground",
          )}
        >
          {isCredit ? "+" : "−"}
          {formatNaira(transaction.amount)}
        </p>
        <p className="text-xs capitalize text-muted">{transaction.status}</p>
      </div>
    </li>
  );
}

export function WalletSection() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [history, setHistory] = useState<PaginatedTransactions | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(() => {
    setStatus("loading");
    setReloadToken((value) => value + 1);
  }, []);

  const goToPage = useCallback((next: number) => {
    setStatus("loading");
    setPage(next);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([fetchWallet(), fetchWalletTransactions(page, PER_PAGE)])
      .then(([walletData, historyData]) => {
        if (!active) {
          return;
        }

        setWallet(walletData);
        setHistory(historyData);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [page, reloadToken]);

  return (
    <section aria-labelledby="wallet-heading" className="space-y-6">
      <div className="rounded-2xl border border-border-strong bg-surface-card p-6 shadow-card sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="wallet-heading"
              className="flex items-center gap-2 text-base font-semibold text-foreground"
            >
              <WalletIcon className="size-4 text-primary" aria-hidden="true" />
              Wallet balance
            </h2>

            {status === "loading" ? (
              <span
                aria-hidden="true"
                className="mt-3 block h-9 w-40 animate-pulse rounded-lg bg-surface-raised"
              />
            ) : (
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {formatNaira(wallet?.balance ?? "0.00")}
              </p>
            )}

            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
              {wallet?.currency ?? "NGN"}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={load}
            disabled={status === "loading"}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-raised p-6">
        <h2 className="text-base font-semibold text-foreground">
          Transaction history
        </h2>

        {status === "loading" ? (
          <div className="mt-4 space-y-3" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-surface"
              />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-4 space-y-4">
            <FormAlert variant="error">
              We could not load your wallet right now. Your balance and
              transactions are safe; please try again.
            </FormAlert>
            <Button type="button" variant="secondary" size="sm" onClick={load}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : null}

        {status === "ready" && history && history.data.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <WalletIcon className="size-6 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              No transactions yet
            </p>
            <p className="max-w-xs text-xs text-subtle">
              Once you fund your wallet or pay for a service, your transactions
              will appear here.
            </p>
          </div>
        ) : null}

        {status === "ready" && history && history.data.length > 0 ? (
          <>
            <ul
              aria-label="Transaction history"
              className="mt-2 divide-y divide-border"
            >
              {history.data.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </ul>

            {history.meta.last_page > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-xs text-subtle">
                  Page {history.meta.current_page} of {history.meta.last_page}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      goToPage(Math.max(1, history.meta.current_page - 1))
                    }
                    disabled={
                      history.meta.current_page <= 1 || status !== "ready"
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      goToPage(
                        Math.min(
                          history.meta.last_page,
                          history.meta.current_page + 1,
                        ),
                      )
                    }
                    disabled={
                      history.meta.current_page >= history.meta.last_page ||
                      status !== "ready"
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
