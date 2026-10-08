<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Exact money value object for NGN accounting.
 *
 * Amounts are held internally as a whole number of minor units (kobo) in a
 * string, so neither parsing nor arithmetic ever goes through a PHP float.
 * BCMath performs the maths, which keeps values exact for the life of an
 * operation. The database remains the source of truth; this object only makes
 * server-side calculations trustworthy.
 */
final class Money
{
    private function __construct(private readonly string $minor) {}

    /**
     * Build from a decimal string or integer, e.g. "1234.56" or 1000.
     * Rejects anything with more than two decimal places or non-numeric input.
     */
    public static function fromDecimal(string|int $value): self
    {
        $value = trim((string) $value);

        if (! preg_match('/^-?\d{1,15}(\.\d{1,2})?$/', $value)) {
            throw new InvalidArgumentException("Invalid money value: {$value}");
        }

        $negative = str_starts_with($value, '-');
        if ($negative) {
            $value = substr($value, 1);
        }

        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');
        $fraction = str_pad($fraction, 2, '0');

        $minor = ltrim(($whole === '' ? '0' : $whole).$fraction, '0');
        if ($minor === '') {
            $minor = '0';
        }

        return new self($negative && $minor !== '0' ? '-'.$minor : $minor);
    }

    public static function zero(): self
    {
        return new self('0');
    }

    public function add(self $other): self
    {
        return new self(bcadd($this->minor, $other->minor, 0));
    }

    public function subtract(self $other): self
    {
        return new self(bcsub($this->minor, $other->minor, 0));
    }

    public function isPositive(): bool
    {
        return bccomp($this->minor, '0', 0) === 1;
    }

    public function isNegative(): bool
    {
        return bccomp($this->minor, '0', 0) === -1;
    }

    public function isZero(): bool
    {
        return bccomp($this->minor, '0', 0) === 0;
    }

    public function greaterThan(self $other): bool
    {
        return bccomp($this->minor, $other->minor, 0) === 1;
    }

    public function equals(self $other): bool
    {
        return bccomp($this->minor, $other->minor, 0) === 0;
    }

    /** Canonical fixed two-decimal value suitable for a decimal(18,2) column. */
    public function toDecimal(): string
    {
        return bcdiv($this->minor, '100', 2);
    }
}
