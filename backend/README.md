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

## Testing

```
php artisan test
```

Tests run against the isolated `lonepay_testing` database (see `phpunit.xml` and
`.env.testing`) and never touch the `lonepay` development database.