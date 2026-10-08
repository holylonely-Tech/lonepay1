<?php

namespace Tests\Feature;

use App\Models\Provider;
use App\Models\ServiceTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletLedgerEntry;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_connection_is_alive_and_uses_utf8mb4(): void
    {
        $this->assertSame('1', (string) DB::selectOne('select 1 as ok')->ok);

        $charset = DB::selectOne(
            'select default_character_set_name as cs from information_schema.schemata where schema_name = ?',
            [DB::getDatabaseName()]
        );

        $this->assertSame('utf8mb4', strtolower($charset->cs));
    }

    public function test_expected_tables_exist(): void
    {
        foreach ([
            'users',
            'wallets',
            'wallet_ledger_entries',
            'transactions',
            'providers',
            'service_transactions',
        ] as $table) {
            $this->assertTrue(Schema::hasTable($table), "Missing table: {$table}");
        }
    }

    public function test_wallet_belongs_to_user_and_defaults_to_zero_balance(): void
    {
        $user = User::factory()->create();
        $wallet = Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);

        $this->assertTrue($wallet->user->is($user));

        $fresh = $wallet->fresh();
        $this->assertSame('0.00', $fresh->balance);
        $this->assertSame('NGN', $fresh->currency);
        $this->assertSame(Wallet::STATUS_ACTIVE, $fresh->status);
    }

    public function test_user_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'dupe@example.com']);

        $this->expectException(QueryException::class);
        User::factory()->create(['email' => 'dupe@example.com']);
    }

    public function test_one_wallet_per_user_and_currency(): void
    {
        $user = User::factory()->create();
        Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);

        $this->expectException(QueryException::class);
        Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);
    }

    public function test_wallet_requires_an_existing_user(): void
    {
        $this->expectException(QueryException::class);
        Wallet::create(['user_id' => 999999, 'currency' => 'NGN']);
    }

    public function test_monetary_columns_keep_two_decimal_places(): void
    {
        $user = User::factory()->create();
        $wallet = Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);
        $wallet->balance = 12345.67;
        $wallet->save();

        $this->assertSame('12345.67', (string) $wallet->fresh()->balance);
        $this->assertSame(
            '12345.67',
            (string) DB::table('wallets')->where('id', $wallet->id)->value('balance')
        );
    }

    public function test_transaction_reference_must_be_unique(): void
    {
        $user = User::factory()->create();
        $wallet = Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);

        $make = fn () => Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => Transaction::TYPE_FUNDING,
            'status' => Transaction::STATUS_PENDING,
            'amount' => 1000,
            'fee' => 0,
            'total' => 1000,
            'reference' => 'REF-UNIQUE-1',
        ]);

        $make();

        $this->expectException(QueryException::class);
        $make();
    }

    public function test_service_transaction_is_one_to_one_with_transaction(): void
    {
        $user = User::factory()->create();
        $wallet = Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);
        $provider = Provider::create([
            'name' => 'MTN',
            'slug' => 'mtn',
            'type' => Provider::TYPE_NETWORK,
        ]);
        $txn = $this->makeTransaction($user, $wallet, 'REF-SVC-1');

        ServiceTransaction::create([
            'transaction_id' => $txn->id,
            'provider_id' => $provider->id,
            'category' => ServiceTransaction::CATEGORY_AIRTIME,
            'customer_identifier' => '08030000000',
            'status' => Transaction::STATUS_SUCCESSFUL,
        ]);

        $this->expectException(QueryException::class);
        ServiceTransaction::create([
            'transaction_id' => $txn->id,
            'provider_id' => $provider->id,
            'category' => ServiceTransaction::CATEGORY_AIRTIME,
            'customer_identifier' => '08030000001',
            'status' => Transaction::STATUS_SUCCESSFUL,
        ]);
    }

    public function test_relationships_are_wired(): void
    {
        $user = User::factory()->create();
        $wallet = Wallet::create(['user_id' => $user->id, 'currency' => 'NGN']);
        $provider = Provider::create([
            'name' => 'MTN',
            'slug' => 'mtn',
            'type' => Provider::TYPE_NETWORK,
        ]);
        $txn = $this->makeTransaction($user, $wallet, 'REF-REL-1');

        $service = ServiceTransaction::create([
            'transaction_id' => $txn->id,
            'provider_id' => $provider->id,
            'category' => ServiceTransaction::CATEGORY_AIRTIME,
            'customer_identifier' => '08030000000',
            'status' => Transaction::STATUS_SUCCESSFUL,
        ]);
        $entry = WalletLedgerEntry::create([
            'wallet_id' => $wallet->id,
            'transaction_id' => $txn->id,
            'direction' => WalletLedgerEntry::DIRECTION_DEBIT,
            'amount' => 505,
            'balance_after' => 0,
            'reference' => 'LEDGER-1',
        ]);

        $this->assertTrue($user->wallet->is($wallet));
        $this->assertTrue($wallet->user->is($user));
        $this->assertTrue($user->transactions->first()->is($txn));
        $this->assertTrue($txn->serviceTransaction->is($service));
        $this->assertTrue($service->provider->is($provider));
        $this->assertTrue($provider->serviceTransactions->first()->is($service));
        $this->assertTrue($wallet->ledgerEntries->first()->is($entry));
        $this->assertTrue($entry->transaction->is($txn));
        $this->assertTrue($txn->ledgerEntries->first()->is($entry));
    }

    private function makeTransaction(User $user, Wallet $wallet, string $reference): Transaction
    {
        return Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => Transaction::TYPE_AIRTIME,
            'status' => Transaction::STATUS_SUCCESSFUL,
            'amount' => 500,
            'fee' => 5,
            'total' => 505,
            'reference' => $reference,
        ]);
    }
}
