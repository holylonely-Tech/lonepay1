"use client";

import { ArrowRight, RefreshCw, Wallet as WalletIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { FormAlert } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "@/components/wallet/transaction-row";
import {
  fetchWalletTransactions,
  type PaginatedTransactions,
} from "@/lib/wallet";

const PER_PAGE = 5;

type Status = "loading" | "ready" | "error";

export function RecentTransactions() {
  const [history, setHistory] = useState<PaginatedTransactions | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setStatus("loading");
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    fetchWalletTransactions(1, PER_PAGE)
      .then((data) => {
        if (!active) {
          return;
        }

        setHistory(data);
        setStatus("ready");
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  return (
    <section
      aria-labelledby="recent-transactions-heading"
      className="rounded-2xl border border-border bg-surface-card p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="recent-transactions-heading"
          className="text-base font-semibold text-foreground"
        >
          Recent transactions
        </h2>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover"
        >
          View all
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {status === "loading" ? (
        <div className="mt-4 space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-xl bg-surface-raised"
            />
          ))}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 space-y-4">
          <FormAlert variant="error">
            We could not load your recent transactions right now. Please try
            again.
          </FormAlert>
          <Button type="button" variant="secondary" size="sm" onClick={reload}>
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
        <ul
          aria-label="Recent transactions"
          className="mt-2 divide-y divide-border"
        >
          {history.data.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
