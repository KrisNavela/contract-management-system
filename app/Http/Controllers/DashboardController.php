<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\LegalDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('dashboard', [
            'contractCounts' => $this->getContractCounts($user),
            'legalCounts'    => $this->getLegalCounts($user),
        ]);
    }

    /* =====================================================
       CONTRACT MODULE
    ===================================================== */

    private function getContractCounts($user): array
    {
        $query = Contract::query();

        // Branch users only see their own
        if ($user->role === 'BRANCH') {
            $query->where('uploaded_by', $user->id);
        }

        // Approver roles could be customized later here
        // For now they see global pending

        return [
            'total'    => (clone $query)->count(),

            'pending'  => (clone $query)
                ->whereNotIn('status', ['APPROVED', 'RETURNED', 'REJECTED'])
                ->count(),

            'approved' => (clone $query)
                ->where('status', 'APPROVED')
                ->count(),

            'returned' => (clone $query)
                ->whereIn('status', ['RETURNED', 'REJECTED'])
                ->count(),
        ];
    }

    /* =====================================================
       LEGAL MODULE
    ===================================================== */

    private function getLegalCounts($user): array
    {
        $query = LegalDocument::query();

        /*
        |-----------------------------------------------------
        | ADMIN
        |-----------------------------------------------------
        */

        if ($user->role === 'ADMIN') {
            // sees everything
        }

        /*
        |-----------------------------------------------------
        | LEGAL USER (Submitter)
        |-----------------------------------------------------
        */

        elseif ($user->legal_role === 'USER') {
            $query->where('created_by', $user->id);
        }

        /*
        |-----------------------------------------------------
        | DEPARTMENT HEAD
        |-----------------------------------------------------
        */

        elseif ($user->legal_role === 'DEPARTMENT_HEAD') {
            $query->where('department_id', $user->department_id);
        }

        /*
        |-----------------------------------------------------
        | LEGAL OFFICER
        |-----------------------------------------------------
        */

        elseif ($user->legal_role === 'LEGAL_OFFICER') {
            // pending = DEPARTMENT_APPROVED
        }

        return [
            'total'    => (clone $query)->count(),

            'pending'  => $this->getLegalPendingCount($user, $query),

            'approved' => (clone $query)
                ->where('status', 'APPROVED')
                ->count(),

            'returned' => (clone $query)
                ->whereIn('status', ['RETURNED', 'REJECTED'])
                ->count(),
        ];
    }

    /* =====================================================
       LEGAL PENDING LOGIC (Role Aware)
    ===================================================== */

    private function getLegalPendingCount($user, $query): int
    {
        if ($user->role === 'ADMIN') {
            return (clone $query)
                ->whereNotIn('status', ['APPROVED', 'RETURNED', 'REJECTED'])
                ->count();
        }

        if ($user->legal_role === 'USER') {
            return (clone $query)
                ->whereIn('status', [
                    'DRAFT',
                    'SUBMITTED',
                    'DEPARTMENT_APPROVED'
                ])->count();
        }

        if ($user->legal_role === 'DEPARTMENT_HEAD') {
            return (clone $query)
                ->where('department_id', $user->department_id)
                ->where('status', 'SUBMITTED')
                ->count();
        }

        if ($user->legal_role === 'LEGAL_OFFICER') {
            return (clone $query)
                ->where('status', 'DEPARTMENT_APPROVED')
                ->count();
        }

        return 0;
    }
}