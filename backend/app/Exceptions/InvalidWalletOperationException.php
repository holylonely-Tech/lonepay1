<?php

namespace App\Exceptions;

use InvalidArgumentException;

/**
 * Thrown when a caller asks the wallet service to do something invalid, such as
 * using a zero/negative amount, an unknown direction, a malformed idempotency
 * key, or an unsupported transaction type. These are programming errors in
 * trusted server-side code, never user input.
 */
class InvalidWalletOperationException extends InvalidArgumentException {}
