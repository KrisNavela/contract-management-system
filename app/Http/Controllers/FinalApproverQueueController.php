<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Inertia\Inertia;

class FinalApproverQueueController extends Controller
{
    public function index()
    {
        $contracts = Contract::with([
            'uploader.branch',
        ])
            ->where('status', 'INITIAL_APPROVAL')
            ->latest()
            ->get();

        return Inertia::render('queue/final-approver/index', [
            'contracts' => $contracts,
        ]);
    }

}
