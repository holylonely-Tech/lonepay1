<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register_and_receives_a_verification_email(): void
    {
        Notification::fake();

        $response = $this->stateful()->postJson('/api/register', [
            'name' => '  Ada Obi  ',
            'email' => '  Ada.Obi@Example.COM ',
            'password' => 'Secret123',
            'password_confirmation' => 'Secret123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'ada.obi@example.com')
            ->assertJsonPath('data.name', 'Ada Obi')
            ->assertJsonPath('data.email_verified', false)
            ->assertJsonMissingPath('data.password');

        $user = User::where('email', 'ada.obi@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('Secret123', $user->password));
        $this->assertNotSame('Secret123', $user->password);

        Notification::assertSentTo($user, VerifyEmail::class);
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'ada.obi@example.com']);

        $this->stateful()->postJson('/api/register', [
            'name' => 'Ada Obi',
            'email' => 'ada.obi@example.com',
            'password' => 'Secret123',
            'password_confirmation' => 'Secret123',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_registration_rejects_a_weak_password(): void
    {
        $this->stateful()->postJson('/api/register', [
            'name' => 'Ada Obi',
            'email' => 'ada.obi@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_registration_requires_a_matching_password_confirmation(): void
    {
        $this->stateful()->postJson('/api/register', [
            'name' => 'Ada Obi',
            'email' => 'ada.obi@example.com',
            'password' => 'Secret123',
            'password_confirmation' => 'Different123',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
