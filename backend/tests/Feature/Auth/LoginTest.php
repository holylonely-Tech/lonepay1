<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'joe@example.com']);

        $response = $this->stateful()->postJson('/api/login', [
            'email' => '  JOE@example.com ',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.email', 'joe@example.com')
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'joe@example.com']);

        $this->stateful()->postJson('/api/login', [
            'email' => 'joe@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_login_does_not_reveal_whether_an_account_exists(): void
    {
        User::factory()->create(['email' => 'joe@example.com']);

        $known = $this->stateful()->postJson('/api/login', [
            'email' => 'joe@example.com',
            'password' => 'wrong-password',
        ]);

        $unknown = $this->stateful()->postJson('/api/login', [
            'email' => 'ghost@example.com',
            'password' => 'wrong-password',
        ]);

        $this->assertSame($known->json('errors.email'), $unknown->json('errors.email'));
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'joe@example.com']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->stateful()->postJson('/api/login', [
                'email' => 'joe@example.com',
                'password' => 'wrong-password',
            ])->assertStatus(422);
        }

        $this->stateful()->postJson('/api/login', [
            'email' => 'joe@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(429);
    }
}
