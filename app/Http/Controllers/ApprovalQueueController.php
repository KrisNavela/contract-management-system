<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Inertia\Inertia;

class ApprovalQueueController extends Controller
{
    private function renderQueue(string $status, string $title)
    {
        $contracts = Contract::where('status', $status)
            ->latest()
            ->get(['id', 'contract_no', 'status', 'created_at']);

        return Inertia::render('queue/index', [
            'title' => $title,
            'contracts' => $contracts,
        ]);
    }

    public function reviewer()
    {
        return $this->renderQueue('REVIEWER_REVIEW', 'Reviewer Queue');
    }

    public function initialVerifier()
    {
        return $this->renderQueue('INITIAL_VERIFICATION', 'Initial Verifier Queue');
    }

    public function finalVerifier()
    {
        return $this->renderQueue('FINAL_VERIFICATION', 'Final Verifier Queue');
    }

    public function initialApprover()
    {
        return $this->renderQueue('INITIAL_APPROVAL', 'Initial Approver Queue');
    }

    public function finalApprover()
    {
        return $this->renderQueue('FINAL_APPROVAL', 'Final Approver Queue');
    }
}
