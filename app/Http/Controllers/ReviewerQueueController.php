<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Inertia\Inertia;

class ReviewerQueueController extends Controller
{
    public function index()
    {
        $contracts = Contract::with(['uploader.branch'])
        ->where('status', 'SUBMITTED')
        ->latest()
        ->paginate(10);

        return Inertia::render('queue/reviewer/index', [
            'contracts' => $contracts,
        ]);
    }
}
