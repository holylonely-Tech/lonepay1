<?php

namespace App\Services;

use App\Exceptions\InsufficientFundsException;
use App\Exceptions\InvalidWalletOperationException;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletLedgerEntry;
use App\Support\Money;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The single authoritative place where a wallet balance changes.
 *
 * Every balance change happens inside a database transaction that locks the
 * wallet row, appends an immutable ledger entry and records a transaction. The
 * API layer must never write to these tables directly; only trusted server-side
 * code (jobs, webhook handlers, admin tooling) calls credit()/debit().
 *
 * Money is passed around as a Money value object and never as a PHP float.
 */
class WalletService
{
    /**
     * Return the user's NGN wallet, creating it once if it does not exist yet.
     *
     * The unique `(user_id, currency)` index makes this safe under a race: if a
     * concurrent request wins the insert we simply read the row it created.
     */
    public function walletFor(User $user): Wallet
    {
        $attributes = [
            'user_id' => $user->id,
            'currency' => Wallet::CURRENCY_NGN,
        ];

        try {
            return Wallet::firstOrCreate($attributes, [
                'balance' => '0.00',
                'status' => Wallet::STATUS_ACTIVE,
            ]);
        } catch (QueryException) {
            return Wallet::where($attributes)->firstOrFail();
        }
    }

    /**
     * Add money to a wallet.
     *
     * @param  array{type?: string, description?: string, metadata?: array<string, mixed>, reference?: string, ledger_reference?: string, provider_reference?: string}  $options
     */
    public function credit(User $user, Money $amount, string $idempotencyKey, array $options = []): Transaction
    {
        return $this->apply($user, WalletLedgerEntry::DIRECTION_CREDIT, $amount, $idempotencyKey, $options);
    }

    /**
     * Remove money from a wallet, refusing to take the balance below zero.
     *
     * @param  array{type?: string, description?: string, metadata?: array<string, mixed>, reference?: string, ledger_reference?: string, provider_reference?: string}  $options
     */
    public function debit(User $user, Money $amount, string $idempotencyKey, array $options = []): Transaction
    {
        return $this->apply($user, WalletLedgerEntry::DIRECTION_DEBIT, $amount, $idempotencyKey, $options);
    }

    /**
     * @param  array{type?: string, description?: string, metadata?: array<string, mixed>, reference?: string, ledger_reference?: string, provider_reference?: string}  $options
     */
    private function apply(
        User $user,
        string $direction,
        Money $amount,
        string $idempotencyKey,
        array $options,
    ): Transaction {
        $this->assertValidOperation($direction, $amount, $idempotencyKey, $options);

        $existing = Transaction::where('idempotency_key', $idempotencyKey)->first();
        if ($existing !== null) {
            return $existing;
        }

        $this->walletFor($user);

        try {
            return DB::transaction(function () use ($user, $direction, $amount, $idempotencyKey, $options) {
                // Lock the authoritative balance row for the duration.
                $wallet = Wallet::where('user_id', $user->id)
                    ->where('currency', Wallet::CURRENCY_NGN)
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $wallet->isActive()) {
                    throw new InvalidWalletOperationException('This wallet is not active.');
                }

                $current = Money::fromDecimal($wallet->balance);
                $balanceAfter = $direction === WalletLedgerEntry::DIRECTION_CREDIT
                    ? $current->add($amount)
                    : $current->subtract($amount);

                if ($balanceAfter->isNegative()) {
                    throw new InsufficientFundsException;
                }

                $wallet->balance = $balanceAfter->toDecimal();
                $wallet->save();

                $type = $options['type'] ?? (
                    $direction === WalletLedgerEntry::DIRECTION_CREDIT
                        ? Transaction::TYPE_FUNDING
                        : throw new InvalidWalletOperationException('A transaction type is required for a debit.')
                );

                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'wallet_id' => $wallet->id,
                    'type' => $type,
                    'status' => Transaction::STATUS_SUCCESSFUL,
                    'amount' => $amount->toDecimal(),
                    'fee' => '0.00',
                    'total' => $amount->toDecimal(),
                    'currency' => $wallet->currency,
                    'reference' => $options['reference'] ?? $this->generateReference('TXN'),
                    'provider_reference' => $options['provider_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'description' => $options['description'] ?? null,
                    'metadata' => $options['metadata'] ?? null,
                ]);

                WalletLedgerEntry::create([
                    'wallet_id' => $wallet->id,
                    'transaction_id' => $transaction->id,
                    'direction' => $direction,
                    'amount' => $amount->toDecimal(),
                    'balance_after' => $balanceAfter->toDecimal(),
                    'reference' => $options['ledger_reference'] ?? $this->generateReference('LED'),
                    'description' => $options['description'] ?? null,
                    'metadata' => $options['metadata'] ?? null,
                ]);

                return $transaction;
            });
        } catch (QueryException $exception) {
            // A concurrent request may have written the same idempotency key
            // first. Return that transaction instead of failing the caller.
            $existing = Transaction::where('idempotency_key', $idempotencyKey)->first();
            if ($existing !== null) {
                return $existing;
            }

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $options
     */
    private function assertValidOperation(
        string $direction,
        Money $amount,
        string $idempotencyKey,
        array $options,
    ): void {
        if (! in_array($direction, [WalletLedgerEntry::DIRECTION_CREDIT, WalletLedgerEntry::DIRECTION_DEBIT], true)) {
            throw new InvalidWalletOperationException("Unknown wallet direction: {$direction}");
        }

        if (! $amount->isPositive()) {
            throw new InvalidWalletOperationException('Wallet amounts must be greater than zero.');
        }

        if ($idempotencyKey === '' || strlen($idempotencyKey) > 191) {
            throw new InvalidWalletOperationException('A non-empty idempotency key of at most 191 characters is required.');
        }

        if (isset($options['type']) && ! in_array($options['type'], Transaction::TYPES, true)) {
            throw new InvalidWalletOperationException("Unsupported transaction type: {$options['type']}");
        }

        if (isset($options['reference']) && ! preg_match('/^[A-Za-z0-9\-_.]{1,64}$/', $options['reference'])) {
            throw new InvalidWalletOperationException('Transaction reference must be 1-64 URL-safe characters.');
        }

        if (isset($options['ledger_reference']) && ! preg_match('/^[A-Za-z0-9\-_.]{1,64}$/', $options['ledger_reference'])) {
            throw new InvalidWalletOperationException('Ledger reference must be 1-64 URL-safe characters.');
        }
    }

    private function generateReference(string $prefix): string
    {
        return $prefix.'-'.now()->format('Ymd').'-'.Str::upper(Str::random(12));
    }
}
