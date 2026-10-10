import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatNaira,
  formatTransactionDate,
  transactionTypeLabel,
  type WalletTransaction,
} from "@/lib/wallet";

type TransactionRowProps = {
  transaction: WalletTransaction;
  className?: string;
};

export function TransactionRow({
  transaction,
  className,
}: TransactionRowProps) {
  const isCredit = transaction.direction === "credit";

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border py-3 last:border-0",
        className,
      )}
    >
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
            {transactionTypeLabel(transaction.type)}
          </p>
          <p className="truncate text-xs text-muted">
            {formatTransactionDate(transaction.created_at)} ·{" "}
            {transaction.reference}
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
