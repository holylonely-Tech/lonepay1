<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\TransactionHistoryRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\WalletResource;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private readonly WalletService $wallets) {}

    /**
     * The authenticated user's wallet summary. The wallet is resolved from the
     * session user only; a browser-supplied user id is never trusted.
     */
    public function show(Request $request): JsonResponse
    {
        $wallet = $this->wallets->walletFor($request->user());

        // A read endpoint must always respond 200 even though the wallet may
        // have just been provisioned on this request.
        return (new WalletResource($wallet))->response()->setStatusCode(200);
    }

    /**
     * Paginated wallet history, scoped to the authenticated user.
     */
    public function transactions(TransactionHistoryRequest $request): JsonResponse
    {
        $perPage = (int) ($request->validated('per_page') ?? 15);

        $transactions = $request->user()
            ->transactions()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return TransactionResource::collection($transactions)->response();
    }
}
