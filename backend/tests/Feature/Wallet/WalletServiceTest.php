<?php

namespace Tests\Feature\Wallet;

use App\Exceptions\InsufficientFundsException;
use App\Exceptions\InvalidWalletOperationException;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletLedgerEntry;
use App\Services\WalletService;
use App\Support\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use RefreshDatabase;

    private WalletService $wallets;

    protected function setUp(): void
    {
        parent::setUp();

        $this->wallets = app(WalletService::class);
    }

    public function test_it_provisions_exactly_one_wallet_per_user(): void
    {
        $user = User::factory()->create();

        $first = $this->wallets->walletFor($user);
        $second = $this->wallets->walletFor($user);

        $this->assertTrue($first->is($second));
        $this->assertSame(1, Wallet::where('user_id', $user->id)->count());
        $this->assertSame('0.00', $first->fresh()->balance);
        $this->assertSame(Wallet::CURRENCY_NGN, $first->currency);
    }

    public function test_a_credit_increases_the_balance_and_writes_a_ledger_entry(): void
    {
        $user = User::factory()->create();

        $transaction = $this->wallets->credit($user, Money::fromDecimal('1500.00'), 'credit-key-1', [
            'type' => Transaction::TYPE_FUNDING,
            'description' => 'Wallet funding',
        ]);

        $this->assertSame('1500.00', $user->wallet->fresh()->balance);
        $this->assertSame(Transaction::STATUS_SUCCESSFUL, $transaction->status);
        $this->assertSame('1500.00', (string) $transaction->amount);
        $this->assertSame(Wallet::CURRENCY_NGN, $transaction->currency);

        $entry = $transaction->ledgerEntries()->sole();
        $this->assertSame(WalletLedgerEntry::DIRECTION_CREDIT, $entry->direction);
        $this->assertSame('1500.00', (string) $entry->amount);
        $this->assertSame('1500.00', (string) $entry->balance_after);
    }

    public function test_a_debit_decreases_the_balance_and_writes_a_ledger_entry(): void
    {
        $user = User::factory()->create();
        $this->wallets->credit($user, Money::fromDecimal('500.00'), 'credit-key-2', [
            'type' => Transaction::TYPE_FUNDING,
        ]);

        $transaction = $this->wallets->debit($user, Money::fromDecimal('125.50'), 'debit-key-1', [
            'type' => Transaction::TYPE_AIRTIME,
        ]);

        $this->assertSame('374.50', $user->wallet->fresh()->balance);

        $entry = $transaction->ledgerEntries()->sole();
        $this->assertSame(WalletLedgerEntry::DIRECTION_DEBIT, $entry->direction);
        $this->assertSame('374.50', (string) $entry->balance_after);
    }

    public function test_a_debit_cannot_take_the_balance_negative(): void
    {
        $user = User::factory()->create();
        $this->wallets->credit($user, Money::fromDecimal('100.00'), 'credit-key-3', [
            'type' => Transaction::TYPE_FUNDING,
        ]);

        try {
            $this->wallets->debit($user, Money::fromDecimal('100.01'), 'debit-key-2', [
                'type' => Transaction::TYPE_AIRTIME,
            ]);
            $this->fail('Expected InsufficientFundsException.');
        } catch (InsufficientFundsException) {
            // expected
        }

        // Everything rolled back: balance untouched, no debit transaction/ledger.
        $this->assertSame('100.00', $user->wallet->fresh()->balance);
        $this->assertSame(1, Transaction::where('user_id', $user->id)->count());
        $this->assertSame(1, WalletLedgerEntry::count());
        $this->assertSame(0, Transaction::where('idempotency_key', 'debit-key-2')->count());
    }

    public function test_replaying_an_idempotency_key_does_not_apply_twice(): void
    {
        $user = User::factory()->create();

        $first = $this->wallets->credit($user, Money::fromDecimal('250.00'), 'idem-key-1', [
            'type' => Transaction::TYPE_FUNDING,
        ]);
        $second = $this->wallets->credit($user, Money::fromDecimal('250.00'), 'idem-key-1', [
            'type' => Transaction::TYPE_FUNDING,
        ]);

        $this->assertTrue($first->is($second));
        $this->assertSame('250.00', $user->wallet->fresh()->balance);
        $this->assertSame(1, Transaction::count());
        $this->assertSame(1, WalletLedgerEntry::count());
    }

    public function test_it_rejects_non_positive_amounts(): void
    {
        $user = User::factory()->create();

        $this->expectException(InvalidWalletOperationException::class);
        $this->wallets->credit($user, Money::fromDecimal('0.00'), 'zero-key', [
            'type' => Transaction::TYPE_FUNDING,
        ]);
    }

    public function test_it_rejects_unknown_transaction_types(): void
    {
        $user = User::factory()->create();

        $this->expectException(InvalidWalletOperationException::class);
        $this->wallets->credit($user, Money::fromDecimal('10.00'), 'bad-type-key', [
            'type' => 'not-a-real-type',
        ]);
    }

    public function test_it_refuses_to_operate_on_a_frozen_wallet(): void
    {
        $user = User::factory()->create();
        $wallet = $this->wallets->walletFor($user);
        $wallet->status = Wallet::STATUS_FROZEN;
        $wallet->save();

        try {
            $this->wallets->credit($user, Money::fromDecimal('10.00'), 'frozen-key', [
                'type' => Transaction::TYPE_FUNDING,
            ]);
            $this->fail('Expected InvalidWalletOperationException.');
        } catch (InvalidWalletOperationException) {
            // expected
        }

        $this->assertSame('0.00', $wallet->fresh()->balance);
        $this->assertSame(0, Transaction::count());
    }
}
