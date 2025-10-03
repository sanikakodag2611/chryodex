<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckCompanySession
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('✅ Middleware Hit - Checking Session');

        if (!session()->has('company_id') || !session()->has('year_id')) {
            Log::warning('⛔ Session check failed. Redirecting to login.');
            return;
        }

        return $next($request);
    }
}