<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a wallet debit would take the balance below zero. The owning
 * database transaction rolls back, so no balance, transaction record or ledger
 * entry is left behind.
 */
class InsufficientFundsException extends RuntimeException
{
    public function __construct(string $message = 'Insufficient wallet balance for this operation.')
    {
        parent::__construct($message);
    }
}
