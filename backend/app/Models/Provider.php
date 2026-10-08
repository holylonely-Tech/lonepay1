<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    public const TYPE_NETWORK = 'network';

    public const TYPE_DISCO = 'disco';

    public const TYPE_CABLE = 'cable';

    public const TYPE_EXAM = 'exam';

    public const TYPE_OTHER = 'other';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'status',
        'logo_url',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function serviceTransactions(): HasMany
    {
        return $this->hasMany(ServiceTransaction::class);
    }
}
