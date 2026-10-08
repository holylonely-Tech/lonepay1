<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
| Cookie (session) based authentication via Sanctum's stateful SPA support.
| No bearer tokens are issued to the browser and no secrets are stored client
| side. The SPA calls GET /sanctum/csrf-cookie before mutating requests.
*/

Route::middleware('throttle:register')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('throttle:login')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('throttle:password-email')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'sendLink']);
});

Route::middleware('throttle:password-reset')->group(function () {
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

/*
|--------------------------------------------------------------------------
| Email verification
|--------------------------------------------------------------------------
| The verification link is a time limited, single use signed URL. The hash
| is bound to the account email so the link cannot be tampered with.
*/

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
        ->middleware('throttle:verification')
        ->name('verification.send');

    /*
    |----------------------------------------------------------------------
    | Wallet
    |----------------------------------------------------------------------
    | Read-only for the authenticated user. There is deliberately no public
    | endpoint that credits or debits a wallet; those operations only exist
    | on WalletService for trusted server-side code.
    */

    Route::get('/wallet', [WalletController::class, 'show']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
});
