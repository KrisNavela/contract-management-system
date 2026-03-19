<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractRemark;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContractApprovalNotification;

class ContractApprovalController extends Controller
{
    /**
     * Role → Expected Current Status
     */
    private const ROLE_STAGE = [
        'REVIEWER'         => 'SUBMITTED',
        'INITIAL_VERIFIER' => 'REVIEWED',
        'FINAL_VERIFIER'   => 'INITIAL_VERIFICATION',
        'INITIAL_APPROVER' => 'FINAL_VERIFICATION',
        'FINAL_APPROVER'   => 'INITIAL_APPROVAL',
    ];

    /**
     * Status → Responsible Role
     */
    private const STATUS_ROLE = [
        'SUBMITTED'            => 'REVIEWER',
        'REVIEWED'             => 'INITIAL_VERIFIER',
        'INITIAL_VERIFICATION' => 'FINAL_VERIFIER',
        'FINAL_VERIFICATION'   => 'INITIAL_APPROVER',
        'INITIAL_APPROVAL'     => 'FINAL_APPROVER',
    ];

    /**
     * Role → Status (for return_to conversion)
     */
    private const ROLE_STATUS = [
        'BRANCH'           => 'RETURNED',
        'REVIEWER'         => 'SUBMITTED',
        'INITIAL_VERIFIER' => 'REVIEWED',
        'FINAL_VERIFIER'   => 'INITIAL_VERIFICATION',
        'INITIAL_APPROVER' => 'FINAL_VERIFICATION',
    ];

    /**
     * Allowed return targets per role (SECURITY)
     */
    private const ALLOWED_RETURNS = [

        'REVIEWER' => [
            'BRANCH'
        ],

        'INITIAL_VERIFIER' => [
            'BRANCH',
            'REVIEWER'
        ],

        'FINAL_VERIFIER' => [
            'BRANCH',
            'REVIEWER',
            'INITIAL_VERIFIER'
        ],

        'INITIAL_APPROVER' => [
            'BRANCH',
            'REVIEWER',
            'INITIAL_VERIFIER',
            'FINAL_VERIFIER'
        ],

        'FINAL_APPROVER' => [
            'BRANCH',
            'REVIEWER',
            'INITIAL_VERIFIER',
            'FINAL_VERIFIER',
            'INITIAL_APPROVER'
        ],
    ];

    public function action(Request $request, Contract $contract)
    {
        $data = $request->validate([
            'action'     => 'required|in:forward,approve,return,reject',
            'return_to'  => 'nullable|string',
            'remarks'    => 'nullable|string',
        ]);

        $user   = $request->user();
        $role   = strtoupper($user->role);
        $status = $contract->status;

        /* =====================================================
        | BRANCH RESUBMIT
        ===================================================== */
        if ($role === 'BRANCH') {

            if ($contract->status !== 'RETURNED' || $data['action'] !== 'forward') {
                abort(403);
            }

            $contract->update([
                'status' => 'SUBMITTED'
            ]);

            ContractRemark::create([
                'contract_id' => $contract->id,
                'user_id'     => $user->id,
                'action'      => 'RESUBMIT',
                'remarks'     => $data['remarks'] ?? null,
            ]);

            // Notify reviewer(s)
            $this->notifyRole(
                'REVIEWER',
                $contract,
                "A contract has been resubmitted for review."
            );

            return back()->with('success', 'Contract resubmitted successfully.');
        }

        /* =====================================================
         | SECURITY CHECK: Role & Current Stage
         ===================================================== */
        if (
            !isset(self::ROLE_STAGE[$role]) ||
            $status !== self::ROLE_STAGE[$role]
        ) {
            abort(403);
        }

        /* =====================================================
         | DETERMINE NEXT STATUS
         ===================================================== */
        $nextStatus = null;

        switch ($data['action']) {

            case 'forward':
                $nextStatus = $this->getForwardStatus($role);
                break;

            case 'approve':
                if ($role !== 'FINAL_APPROVER') {
                    abort(403);
                }
                $nextStatus = 'APPROVED';
                break;

            case 'return':
                $nextStatus = $this->handleReturn($role, $data['return_to'] ?? null);
                break;

            case 'reject':
                $nextStatus = 'REJECTED';
                break;

            default:
                abort(403);
        }

        /* =====================================================
         | UPDATE CONTRACT
         ===================================================== */
        $contract->update([
            'status' => $nextStatus
        ]);

        /* =====================================================
         | SAVE REMARK
         ===================================================== */
        ContractRemark::create([
            'contract_id' => $contract->id,
            'user_id'     => $user->id,
            'action'      => strtoupper($data['action']),
            'remarks'     => $data['remarks'] ?? null,
        ]);

        /* =====================================================
         | NOTIFICATIONS
         ===================================================== */

        if ($data['action'] === 'forward') {

            if (isset(self::STATUS_ROLE[$nextStatus])) {
                $this->notifyRole(
                    self::STATUS_ROLE[$nextStatus],
                    $contract,
                    "A contract has been forwarded to your stage."
                );
            }
        }

        if ($data['action'] === 'return') {

            if ($data['return_to'] === 'UPLOADER') {
                $this->notifyUser(
                    $contract->uploader,
                    $contract,
                    "Your contract has been returned for correction."
                );
            } elseif (isset(self::STATUS_ROLE[$nextStatus])) {
                $this->notifyRole(
                    self::STATUS_ROLE[$nextStatus],
                    $contract,
                    "A contract has been returned to your stage."
                );
            }
        }

        if ($data['action'] === 'reject') {
            $this->notifyUser(
                $contract->uploader,
                $contract,
                "Your contract has been rejected."
            );
        }

        if ($data['action'] === 'approve') {
            $this->notifyUser(
                $contract->uploader,
                $contract,
                "Your contract has been fully approved."
            );
        }

        return back()->with('success', 'Action saved successfully.');
    }

    /* =====================================================
     | HANDLE FORWARD
     ===================================================== */
    private function getForwardStatus(string $role): string
    {
        return match ($role) {
            'REVIEWER'         => 'REVIEWED',
            'INITIAL_VERIFIER' => 'INITIAL_VERIFICATION',
            'FINAL_VERIFIER'   => 'FINAL_VERIFICATION',
            'INITIAL_APPROVER' => 'INITIAL_APPROVAL',
            default            => abort(403),
        };
    }

    /* =====================================================
     | HANDLE RETURN (SECURE)
     ===================================================== */
    private function handleReturn(string $role, ?string $returnTo): string
    {
        if (!$returnTo) {
            abort(403);
        }

        if (
            !isset(self::ALLOWED_RETURNS[$role]) ||
            !in_array($returnTo, self::ALLOWED_RETURNS[$role])
        ) {
            abort(403);
        }

        return self::ROLE_STATUS[$returnTo] ?? abort(403);
    }

    /* =====================================================
     | HELPER: Notify Specific User
     ===================================================== */
    private function notifyUser($user, $contract, $message)
    {
        /* if ($user && $user->email) {
            Mail::to($user->email)
                ->queue(new ContractApprovalNotification($contract, $message));
        } */
    }

    /* =====================================================
     | HELPER: Notify All Users By Role
     ===================================================== */
    private function notifyRole($role, $contract, $message)
    {
        $users = User::where('role', $role)->get();

        foreach ($users as $user) {
            $this->notifyUser($user, $contract, $message);
        }
    }
}