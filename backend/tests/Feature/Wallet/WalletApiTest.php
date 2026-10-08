<?php

namespace Tests\Feature\Wallet;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use App\Support\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletApiTest extends TestCase
{
    use RefreshDatabase;

    private WalletService $wallets;

    protected function setUp(): void
    {
        parent::setUp();

        $this->wallets = app(WalletService::class);
    }

    public function test_guests_cannot_read_a_wallet(): void
    {
        $this->getJson('/api/wallet')->assertStatus(401);
        $this->getJson('/api/wallet/transactions')->assertStatus(401);
    }

    public function test_it_returns_the_persisted_wallet_summary(): void
    {
        $user = User::factory()->create();
        $this->wallets->credit($user, Money::fromDecimal('1500.50'), 'api-credit-1', [
            'type' => Transaction::TYPE_FUNDING,
        ]);

        $this->actingAs($user)
            ->getJson('/api/wallet')
            ->assertOk()
            ->assertJsonPath('data.currency', 'NGN')
            ->assertJsonPath('data.balance', '1500.50')
            ->assertJsonPath('data.status', Wallet::STATUS_ACTIVE)
            ->assertJsonMissingPath('data.user_id');
    }

    public function test_it_provisions_exactly_one_wallet_on_first_read(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/wallet')->assertOk();
        $this->actingAs($user)->getJson('/api/wallet')->assertOk();

        $this->assertSame(1, Wallet::where('user_id', $user->id)->count());
    }

    public function test_it_returns_paginated_history_with_metadata(): void
    {
        $user = User::factory()->create();

        foreach (['a', 'b', 'c'] as $suffix) {
            $this->wallets->credit($user, Money::fromDecimal('100.00'), "api-page-{$suffix}", [
                'type' => Transaction::TYPE_FUNDING,
            ]);
        }

        $response = $this->actingAs($user)
            ->getJson('/api/wallet/transactions?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $response->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2);

        $this->assertNotNull($response->json('links.next'));
    }

    public function test_history_is_scoped_to_the_authenticated_user(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();

        $this->wallets->credit($alice, Money::fromDecimal('100.00'), 'alice-credit', [
            'type' => Transaction::TYPE_FUNDING,
        ]);

        $this->actingAs($bob)
            ->getJson('/api/wallet/transactions')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('meta.total', 0);
    }

    public function test_it_formats_monetary_values_and_direction_consistently(): void
    {
        $user = User::factory()->create();
        $this->wallets->credit($user, Money::fromDecimal('500.00'), 'fmt-credit', [
            'type' => Transaction::TYPE_FUNDING,
        ]);
        $this->wallets->debit($user, Money::fromDecimal('200.25'), 'fmt-debit', [
            'type' => Transaction::TYPE_AIRTIME,
            'description' => 'MTN airtime',
        ]);

        $response = $this->actingAs($user)->getJson('/api/wallet/transactions')->assertOk();

        $byType = collect($response->json('data'))->keyBy('type');

        $this->assertSame('500.00', $byType['funding']['amount']);
        $this->assertSame('credit', $byType['funding']['direction']);
        $this->assertSame('200.25', $byType['airtime']['amount']);
        $this->assertSame('debit', $byType['airtime']['direction']);
        $this->assertSame('MTN airtime', $byType['airtime']['description']);
        $this->assertSame('NGN', $byType['funding']['currency']);
    }

    public function test_it_rejects_an_excessive_page_size(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/wallet/transactions?per_page=100')
            ->assertStatus(422)
            ->assertJsonValidationErrors('per_page');
    }
}
