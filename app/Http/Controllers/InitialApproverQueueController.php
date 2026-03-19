<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Inertia\Inertia;

class InitialApproverQueueController extends Controller
{
    public function index()
    {
        $contracts = Contract::with([
            'uploader.branch',
        ])
            ->where('status', 'FINAL_VERIFICATION')
            ->latest()
            ->get();

        return Inertia::render('queue/initial-approver/index', [
            'contracts' => $contracts,
        ]);
    }
}