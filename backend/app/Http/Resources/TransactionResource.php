<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public representation of a wallet transaction. Internal `metadata` is not
 * exposed because it can contain provider payloads that are not safe to share.
 *
 * @mixin Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'type' => $this->type,
            'status' => $this->status,
            'direction' => $this->direction(),
            'amount' => (string) $this->amount,
            'fee' => (string) $this->fee,
            'total' => (string) $this->total,
            'currency' => $this->currency,
            'description' => $this->description,
            'provider_reference' => $this->provider_reference,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
