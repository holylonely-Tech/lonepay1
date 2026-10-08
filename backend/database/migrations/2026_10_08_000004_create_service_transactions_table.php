<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category', 32);
            $table->string('customer_identifier', 191);
            $table->string('plan_reference', 128)->nullable();
            $table->string('provider_reference', 128)->nullable();
            $table->text('token')->nullable();
            $table->string('status', 20)->default('pending');
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index('provider_reference');
            $table->index('customer_identifier');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_transactions');
    }
};
