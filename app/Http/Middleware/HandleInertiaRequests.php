<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            /*
            |--------------------------------------------------------------------------
            | Auth
            |--------------------------------------------------------------------------
            */
            'auth' => [
                'user' => $request->user(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Flash Messages
            |--------------------------------------------------------------------------
            | These are available via usePage().props.flash in React
            */
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'transaction_no' => $request->session()->get('transaction_no'),
            ],
        ]);
    }
}
