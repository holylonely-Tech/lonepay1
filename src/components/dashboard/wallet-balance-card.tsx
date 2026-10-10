"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { FormAlert } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import {
  fetchWallet,
  formatNaira,
  formatTransactionDate,
  type WalletSummary,
} from "@/lib/wallet";

type Status = "loading" | "ready" | "error";

export function WalletBalanceCard() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [hidden, setHidden] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setStatus("loading");
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    fetchWallet()
      .then((data) => {
        if (!active) {
          return;
        }

        setWallet(data);
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
      aria-labelledby="wallet-balance-heading"
      className="rounded-2xl border border-border-strong bg-surface-card p-6 shadow-card sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary"
          >
            <WalletIcon className="size-4" />
          </span>
          <h2
            id="wallet-balance-heading"
            className="text-sm font-semibold text-subtle"
          >
            Wallet balance
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {status === "ready" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={hidden ? "Show balance" : "Hide balance"}
              aria-pressed={hidden}
              onClick={() => setHidden((value) => !value)}
            >
              {hidden ? (
                <Eye className="size-4" aria-hidden="true" />
              ) : (
                <EyeOff className="size-4" aria-hidden="true" />
              )}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={reload}
            disabled={status === "loading"}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {status === "loading" ? (
        <span
          aria-hidden="true"
          className="mt-5 block h-10 w-48 animate-pulse rounded-xl bg-surface-raised"
        />
      ) : null}

      {status === "error" ? (
        <div className="mt-5 space-y-4">
          <FormAlert variant="error">
            We could not load your wallet balance. Your balance is safe; please
            try again.
          </FormAlert>
          <Button type="button" variant="secondary" size="sm" onClick={reload}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {status === "ready" ? (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-4xl">
              {hidden ? "₦••••••" : formatNaira(wallet?.balance ?? "0.00")}
            </p>
            <span className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-semibold text-muted">
              {wallet?.currency ?? "NGN"}
            </span>
            {wallet?.status ? (
              <span className="rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent capitalize">
                {wallet.status}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-muted">
            Last updated {formatTransactionDate(wallet?.updated_at ?? null)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/transactions">
                View transactions
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-subtle">
              Wallet funding is not available from the dashboard yet.
            </p>
          </div>
        </>
      ) : null}
    </section>
  );
}
