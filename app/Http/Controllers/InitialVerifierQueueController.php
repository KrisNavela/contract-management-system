<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Inertia\Inertia;

class InitialVerifierQueueController extends Controller
{
    public function index()
    {
        $contracts = Contract::with(['uploader.branch'])
            ->where('status', 'REVIEWED')
            ->latest()
            ->get();

        return Inertia::render('queue/initial-verifier/index', [
            'contracts' => $contracts,
        ]);
    }
}
