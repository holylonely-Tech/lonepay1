<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_authenticated_user_can_view_their_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissingPath('data.password');
    }

    public function test_a_profile_only_ever_returns_the_authenticated_user(): void
    {
        $alice = User::factory()->create(['email' => 'alice@example.com']);
        User::factory()->create(['email' => 'bob@example.com']);

        $this->actingAs($alice)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.email', 'alice@example.com')
            ->assertJsonMissing(['email' => 'bob@example.com']);
    }

    public function test_guests_cannot_view_their_profile(): void
    {
        $this->getJson('/api/user')->assertStatus(401);
    }

    public function test_guests_cannot_log_out(): void
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    public function test_a_user_can_log_out(): void
    {
        User::factory()->create(['email' => 'joe@example.com']);

        $this->stateful()->postJson('/api/login', [
            'email' => 'joe@example.com',
            'password' => 'password',
        ])->assertOk();

        $this->assertAuthenticated('web');

        $this->stateful()
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'You have been signed out.');

        $this->assertGuest('web');
    }
}
