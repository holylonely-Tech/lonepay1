<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('wallet_id')->constrained()->restrictOnDelete();
            $table->string('type', 32);
            $table->string('status', 20)->default('pending');
            $table->decimal('amount', 18, 2);
            $table->decimal('fee', 18, 2)->default(0);
            $table->decimal('total', 18, 2);
            $table->char('currency', 3)->default('NGN');
            $table->string('reference', 64)->unique();
            $table->string('provider_reference', 128)->nullable();
            $table->string('idempotency_key', 128)->nullable()->unique();
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['wallet_id', 'created_at']);
            $table->index('type');
            $table->index('provider_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
