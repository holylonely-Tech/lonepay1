<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    public const TYPE_FUNDING = 'funding';

    public const TYPE_AIRTIME = 'airtime';

    public const TYPE_DATA = 'data';

    public const TYPE_ELECTRICITY = 'electricity';

    public const TYPE_CABLE_TV = 'cable_tv';

    public const TYPE_EXAM_PIN = 'exam_pin';

    public const TYPE_TRANSFER = 'transfer';

    public const TYPE_REFUND = 'refund';

    public const TYPE_FEE = 'fee';

    public const TYPE_REVERSAL = 'reversal';

    public const STATUS_PENDING = 'pending';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_SUCCESSFUL = 'successful';

    public const STATUS_FAILED = 'failed';

    public const STATUS_REVERSED = 'reversed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'wallet_id',
        'type',
        'status',
        'amount',
        'fee',
        'total',
        'currency',
        'reference',
        'provider_reference',
        'idempotency_key',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'total' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function serviceTransaction(): HasOne
    {
        return $this->hasOne(ServiceTransaction::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(WalletLedgerEntry::class);
    }
}
