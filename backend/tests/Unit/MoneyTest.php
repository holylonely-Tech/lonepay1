<?php

namespace Tests\Unit;

use App\Support\Money;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_it_parses_decimal_strings_exactly(): void
    {
        $this->assertSame('0.00', Money::fromDecimal('0.00')->toDecimal());
        $this->assertSame('1234.50', Money::fromDecimal('1234.5')->toDecimal());
        $this->assertSame('1234.56', Money::fromDecimal('1234.56')->toDecimal());
        $this->assertSame('1234.00', Money::fromDecimal(1234)->toDecimal());
        $this->assertSame('10.00', Money::fromDecimal('0010')->toDecimal());
    }

    public function test_it_keeps_precision_for_large_values(): void
    {
        $money = Money::fromDecimal('999999999999999.99');

        $this->assertSame('999999999999999.99', $money->toDecimal());
        $this->assertSame('0.01', $money->add(Money::fromDecimal('0.01'))->subtract(Money::fromDecimal('999999999999999.99'))->toDecimal());
    }

    public function test_addition_and_subtraction_are_exact(): void
    {
        $total = Money::fromDecimal('0.10')
            ->add(Money::fromDecimal('0.20'));

        $this->assertSame('0.30', $total->toDecimal());

        // A float-based calculation would produce 0.30000000000000004.
        $this->assertSame('0.01', Money::fromDecimal('1.00')->subtract(Money::fromDecimal('0.99'))->toDecimal());
    }

    public function test_it_reports_sign_and_zero(): void
    {
        $this->assertTrue(Money::fromDecimal('0.01')->isPositive());
        $this->assertFalse(Money::fromDecimal('0.00')->isPositive());
        $this->assertTrue(Money::zero()->isZero());
        $this->assertTrue(Money::fromDecimal('1.00')->subtract(Money::fromDecimal('2.00'))->isNegative());
    }

    public function test_it_compares_amounts_without_floats(): void
    {
        $this->assertTrue(Money::fromDecimal('500.05')->subtract(Money::fromDecimal('500.04'))->isPositive());
        $this->assertSame(
            '0.01',
            Money::fromDecimal('500.05')->subtract(Money::fromDecimal('500.04'))->toDecimal()
        );
    }

    #[DataProvider('invalidValues')]
    public function test_it_rejects_invalid_values(string $value): void
    {
        $this->expectException(InvalidArgumentException::class);
        Money::fromDecimal($value);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function invalidValues(): array
    {
        return [
            'empty' => [''],
            'letters' => ['abc'],
            'three decimals' => ['1.234'],
            'exponent' => ['1e3'],
            'double dot' => ['1.2.3'],
            'too many digits' => ['1234567890123456.00'],
        ];
    }
}
