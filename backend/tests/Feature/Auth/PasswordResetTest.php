<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_reset_link_is_sent_for_a_known_account(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'joe@example.com']);

        $this->stateful()
            ->postJson('/api/forgot-password', ['email' => 'joe@example.com'])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_link_response_is_identical_for_unknown_accounts(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'joe@example.com']);

        $known = $this->stateful()
            ->postJson('/api/forgot-password', ['email' => 'joe@example.com']);

        $unknown = $this->stateful()
            ->postJson('/api/forgot-password', ['email' => 'ghost@example.com']);

        $known->assertOk();
        $unknown->assertOk();
        $this->assertSame($known->json('message'), $unknown->json('message'));

        Notification::assertSentToTimes($user, ResetPassword::class, 1);
    }

    public function test_a_user_can_reset_their_password_with_a_valid_token(): void
    {
        $user = User::factory()->create(['email' => 'joe@example.com']);
        $token = Password::broker()->createToken($user);

        $this->stateful()->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'joe@example.com',
            'password' => 'NewSecret123',
            'password_confirmation' => 'NewSecret123',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewSecret123', $user->fresh()->password));
    }

    public function test_a_reset_token_cannot_be_used_twice(): void
    {
        $user = User::factory()->create(['email' => 'joe@example.com']);
        $token = Password::broker()->createToken($user);

        $payload = [
            'token' => $token,
            'email' => 'joe@example.com',
            'password' => 'NewSecret123',
            'password_confirmation' => 'NewSecret123',
        ];

        $this->stateful()->postJson('/api/reset-password', $payload)->assertOk();

        $this->stateful()->postJson('/api/reset-password', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_reset_fails_with_an_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'joe@example.com']);

        $this->stateful()->postJson('/api/reset-password', [
            'token' => 'not-a-real-token',
            'email' => 'joe@example.com',
            'password' => 'NewSecret123',
            'password_confirmation' => 'NewSecret123',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
}
