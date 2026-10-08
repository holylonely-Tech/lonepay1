<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Mark the next request as coming from the trusted SPA origin so Sanctum
     * treats it as a stateful (cookie/session) request.
     */
    protected function stateful(): static
    {
        $origin = (string) config('app.frontend_url');

        return $this->withHeaders([
            'Origin' => $origin,
            'Referer' => rtrim($origin, '/').'/',
        ]);
    }
}
