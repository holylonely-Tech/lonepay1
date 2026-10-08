# LonePay API (Laravel backend)

Separate REST API and database layer for the LonePay VTU platform. The Next.js
frontend in the repository root talks to this backend over HTTP only; the
browser never connects to MySQL directly.

- Framework: Laravel 12 (PHP 8.2+)
- Database: MySQL/MariaDB, `utf8mb4` / `utf8mb4_unicode_ci`
- Dev database: `lonepay`
- Test database: `lonepay_testing` (isolated; tests use `RefreshDatabase`)

## Local setup

```
composer install
cp .env.example .env        # then set DB_* values and run:
php artisan key:generate
php artisan migrate
```

`.env`, `.env.testing`, `vendor/` and logs are git-ignored. Never commit real
credentials.

## Stage 1 schema (implemented)

| Table | Purpose |
| --- | --- |
| `users` | Accounts (Laravel default). |
| `wallets` | One balance per user/currency; unique `(user_id, currency)`. `balance` is `decimal(18,2)`. |
| `wallet_ledger_entries` | Append-only ledger. Records `direction`, `amount`, `balance_after`, unique `reference`. Source of truth for balance changes. |
| `transactions` | All money movements/financial events. Unique `reference` and `idempotency_key`; FK to `users` and `wallets`. |
| `providers` | VTU service providers (networks, discos, cable, exam). Unique `slug`. |
| `service_transactions` | One-to-one detail for a service purchase (`transaction_id` unique); FK to `providers`; stores request/response payloads. |
| `cache`, `jobs`, `failed_jobs`, `sessions`, `password_reset_tokens` | Laravel framework tables. |

Money is stored as `decimal(18,2)`; the wallet balance is a cache and the ledger
is authoritative. Future wallet operations must mutate the balance inside a DB
transaction using row locking (`lockForUpdate`) and idempotency keys.

## Deferred to later stages (not yet created)

These tables are intentionally not part of Stage 1 and must be added when the
matching feature is built:

- `service_categories` / `service_offerings` - catalog of plans, bundles and
  tariffs (airtime denominations, data bundles, cable packages, exam pins).
- `payment_attempts` - records for deposit/payment gateway attempts.
- `webhook_events` - inbound provider/gateway webhook payloads and processing
  state (needed for idempotent reconciliation).
- `refunds` / `reversals` - first-class refund and reversal workflows.
- `audit_logs` - immutable operator/admin action trail.
- `beneficiaries` - saved recipients for transfers.
- `roles` / `permissions` - RBAC if admin roles are required.

## Stage 3 wallet accounting (implemented)

Money is never handled as a PHP float. The `App\Support\Money` value object
holds an exact number of minor units (kobo) and uses BCMath for arithmetic. The
`decimal(18,2)` columns plus the append-only `wallet_ledger_entries` table remain
the source of truth.

`App\Services\WalletService` is the only place a balance changes:

- `walletFor(User)` returns the user's NGN wallet, creating it once. The unique
  `(user_id, currency)` index makes this safe under concurrent requests.
- `credit(User, Money, idempotencyKey, options)` and
  `debit(User, Money, idempotencyKey, options)` run inside a DB transaction,
  lock the wallet row (`lockForUpdate`), append an immutable ledger entry and
  write a transaction record. A debit that would take the balance below zero
  throws `InsufficientFundsException` and rolls back **all** related writes.
- Operations are idempotent: replaying an `idempotency_key` returns the original
  transaction without applying it twice. Unique indexes on
  `transactions.idempotency_key`, `transactions.reference` and
  `wallet_ledger_entries.reference` back this up.
- Amounts, directions, transaction types, references and idempotency keys are
  validated server-side before any write.

The service is only callable from trusted server-side code. There is no HTTP
endpoint that credits or debits a wallet.

### Wallet endpoints (authenticated, Sanctum cookie/session)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/wallet` | Wallet summary: persisted `balance`, `currency`, `status`. |
| `GET` | `/api/wallet/transactions` | Paginated history. Query: `page`, `per_page` (max 50, default 15). |

Both resolve the wallet through `$request->user()` only. A browser-supplied user
id is never trusted and one user can never read another user's wallet or
history. Monetary values are returned as fixed two-decimal strings.

### Future payment webhooks (not implemented)

Wallet credits in later stages must originate from verified payment-provider
events, never from a browser "payment successful" message. A webhook handler
must:

1. Verify the provider signature with a secret from the environment using a
   timing-safe comparison (`hash_equals`) and reject unsigned/unknown requests.
2. Reject replays by recording each provider event id in a unique
   `webhook_events` row (deferred table) or by passing the provider event id as
   the `idempotencyKey` to `WalletService::credit()`.
3. Apply accounting atomically through `WalletService` so the transaction,
   ledger entry and balance update either all commit or all roll back.
4. Respond quickly and idempotently so the provider's retries are safe.

## Testing

```
php artisan test
```

Tests run against the isolated `lonepay_testing` database (see `phpunit.xml` and
`.env.testing`) and never touch the `lonepay` development database.