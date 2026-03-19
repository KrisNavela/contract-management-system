<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Inertia\Inertia;

class FinalVerifierQueueController extends Controller
{
    public function index()
    {
        $contracts = Contract::with(['uploader.branch'])
            ->where('status', 'INITIAL_VERIFICATION')
            ->latest()
            ->get();

        return Inertia::render('queue/final-verifier/index', [
            'contracts' => $contracts,
        ]);
    }
}
