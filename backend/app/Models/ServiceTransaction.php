<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceTransaction extends Model
{
    public const CATEGORY_AIRTIME = 'airtime';

    public const CATEGORY_DATA = 'data';

    public const CATEGORY_ELECTRICITY = 'electricity';

    public const CATEGORY_CABLE_TV = 'cable_tv';

    public const CATEGORY_EXAM_PIN = 'exam_pin';

    protected $fillable = [
        'transaction_id',
        'provider_id',
        'category',
        'customer_identifier',
        'plan_reference',
        'provider_reference',
        'token',
        'status',
        'request_payload',
        'response_payload',
    ];

    protected function casts(): array
    {
        return [
            'request_payload' => 'array',
            'response_payload' => 'array',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }
}
