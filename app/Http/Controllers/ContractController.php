<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractFile;
use App\Models\ContractRemark;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContractController extends Controller
{
    /**
     * Show list of contracts (per role)
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Contract::with([
            'uploader.branch',
            'remarks.user', // important for last action
        ])->latest();

        /* ================= ROLE ISOLATION ================= */
        if ($user->role === 'BRANCH') {
            $query->where('uploaded_by', $user->id);
        }

        /* ================= FILTER: TRANSACTION NO ================= */
        if ($request->filled('transaction_no')) {
            $query->where(
                'transaction_no',
                'like',
                '%' . $request->transaction_no . '%'
            );
        }

        /* ================= FILTER: APPROVAL STATUS ================= */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        /* ================= FILTER: EXECUTION STATUS ================= */
        if ($request->filled('execution')) {
            if ($request->execution === 'uploaded') {
                $query->whereNotNull('execution_file_path');
            }

            if ($request->execution === 'not_uploaded') {
                $query->whereNull('execution_file_path');
            }
        }

        /* ================= FILTER: BRANCH ================= */
        if ($request->filled('branch_id') && $user->role !== 'BRANCH') {
            $query->whereHas('uploader', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });
        }

        /* ================= PAGINATION ================= */
        $contracts = $query
            ->paginate(10)
            ->withQueryString()
            ->through(function ($contract) {

                $lastRemark = $contract->remarks->first();

                return [
                    'id' => $contract->id,
                    'transaction_no' => $contract->transaction_no,
                    'contract_type' => $contract->contract_type,
                    'status' => $contract->status,
                    'execution_file_path' => $contract->execution_file_path,
                    'created_at' => $contract->created_at,

                    'uploader' => [
                        'name' => $contract->uploader->name,
                        'branch' => $contract->uploader->branch,
                    ],

                    // 🔥 LAST ACTION PROPERLY RETURNED
                    'last_action' => $lastRemark ? [
                        'action' => $lastRemark->action,
                        'user' => $lastRemark->user?->name,
                    ] : null,
                ];
            });

        /* ================= BRANCH DROPDOWN VISIBILITY ================= */
        if ($user->role === 'ADMIN') {
            $branches = Branch::select('id', 'name')->get();
        }
        elseif ($user->role === 'BRANCH') {
            $branches = $user->branch
                ? collect([
                    [
                        'id' => $user->branch->id,
                        'name' => $user->branch->name,
                    ]
                ])
                : collect();
        }
        else {
            $branches = Branch::whereHas('users.contracts')
                ->select('id', 'name')
                ->distinct()
                ->get();
        }

        return Inertia::render('contracts/index', [
            'contracts' => $contracts,
            'branches' => $branches,
            'filters' => $request->only([
                'transaction_no',
                'status',
                'execution',
                'branch_id',
            ]),
        ]);
    }


    /**
     * Show upload page (Branch User)
     */
    public function create()
    {
        return Inertia::render('contracts/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'contract_type' => 'required|in:NEW,RENEWAL',
            'remarks' => 'required|string|min:5',
            'files' => 'required|array|min:1',
            'files.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:5120',
        ]);

        $contract = Contract::create([
            'contract_type' => $request->contract_type,
            'uploaded_by' => auth()->id(),
            'status' => 'SUBMITTED',
        ]);

        // Save files
        foreach ($request->file('files') as $file) {
            $path = $file->store('contracts', 'public');

            $contract->files()->create([
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension(),
                'uploaded_by' => auth()->id(),
            ]);
        }

        // ✅ INITIAL REMARK (VERY IMPORTANT)
        $contract->remarks()->create([
            'user_id' => auth()->id(),
            'role' => auth()->user()->role,
            'action' => 'SUBMITTED',
            'remarks' => $request->remarks,
        ]);


        /* =====================================================
        | NOTIFY REVIEWER(S) ON INITIAL SUBMISSION
        ===================================================== */

        $reviewers = \App\Models\User::where('role', 'REVIEWER')->get();

        foreach ($reviewers as $reviewer) {
            if ($reviewer->email) {
                \Mail::to($reviewer->email)
                    ->queue(new \App\Mail\ContractApprovalNotification(
                        $contract,
                        "A new contract has been submitted for review."
                    ));
            }
        }

        
        return redirect()
            ->route('contracts.show', $contract->id)
            ->with('success', 'Contract submitted successfully.');
    }



    /**
     * Show single contract details
     */
    public function show(Contract $contract)
    {
        $contract->load([
            'files',
            'remarks.user',
        ]);

        return Inertia::render('contracts/show', [
            'contract' => $contract,
        ]);
    }

    public function edit(Contract $contract)
    {
        $contract->load('files');

        return Inertia::render('contracts/edit', [
            'contract' => $contract,
        ]);
    }

    public function update(Request $request, Contract $contract)
    {
        $request->validate([
            'contract_type' => 'required|in:NEW,RENEWAL',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:5120',
        ]);

        //dd($request->all());

        // Update Contract Type
        $contract->update([
            'contract_type' => $request->contract_type,
            'status' => 'SUBMITTED',
        ]);

        // If new file uploaded, store it
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('contracts', 'public');

            $contract->files()->create([
                'file_path' => $path,
                'file_type' => $request->file('file')->getClientOriginalExtension(),
                'uploaded_by' => auth()->id(),
            ]);
        }

        return redirect()
            ->route('contracts.show', $contract)
            ->with('success', 'Contract updated successfully.');
    }

    public function destroyFile(ContractFile $contractFile)
    {
        // Delete physical file
        if (Storage::disk('public')->exists($contractFile->file_path)) {
            Storage::disk('public')->delete($contractFile->file_path);
        }

        // Delete DB record
        $contractFile->delete();

        return back()->with('success', 'Attachment deleted successfully.');
    }

    public function uploadFile(Request $request, Contract $contract)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:5120',
        ]);

        $path = $request->file('file')->store('contracts', 'public');

        $contract->files()->create([
            'file_path' => $path,
            'file_type' => $request->file('file')->getClientOriginalExtension(),
            'uploaded_by' => auth()->id(),
        ]);

        return back()->with('success', 'File uploaded successfully.');
    }

    /**
     * Approval flow map (single source of truth)
     */
    private const FLOW = [
        'SUBMITTED'            => 'REVIEWED',
        'REVIEWED'             => 'INITIAL_VERIFICATION',
        'INITIAL_VERIFICATION' => 'FINAL_VERIFICATION',
        'FINAL_VERIFICATION'   => 'INITIAL_APPROVAL',
        'INITIAL_APPROVAL'     => 'FINAL_APPROVAL',
        'FINAL_APPROVAL'       => 'APPROVED',
    ];

    /**
     * Role vs allowed status
     */
    private const ROLE_STATUS = [
        'REVIEWER'         => 'SUBMITTED',
        'INITIAL_VERIFIER' => 'REVIEWED',
        'FINAL_VERIFIER'   => 'INITIAL_VERIFICATION',
        'INITIAL_APPROVER' => 'INITIAL_APPROVAL',
        'FINAL_APPROVER'   => 'FINAL_APPROVAL',
    ];

    /**
     * Generic approval action
     */
    public function action(Request $request, Contract $contract)
    {
        $request->validate([
            'action'  => 'required|in:FORWARD,RETURN,REJECT,APPROVE',
            'remarks' => 'nullable|string',
        ]);

        $user   = auth()->user();
        $role   = $user->role;
        $status = $contract->status;

        /**
         * 🔐 SECURITY CHECK
         */
        // ✅ Branch can resubmit returned contracts
        if ($role === 'BRANCH' && $status === 'RETURNED') {
            // allowed
        }
        else {
            if (!isset(self::ROLE_STATUS[$role]) ||
                self::ROLE_STATUS[$role] !== $status
            ) {
                abort(403, 'You are not authorized to act on this contract.');
            }
        }

        /**
         * 🧠 DETERMINE NEXT STATUS
         */
        switch ($request->action) {

            case 'FORWARD':

                if ($role === 'BRANCH') {
                    $nextStatus = 'SUBMITTED';
                }
                else {
                    if (!isset(self::FLOW[$status])) {
                        abort(400, 'Invalid approval flow.');
                    }
                    $nextStatus = self::FLOW[$status];
                }

                break;

            case 'APPROVE':

                if ($status !== 'FINAL_APPROVAL') {
                    abort(400, 'Only final approver can approve.');
                }
                $nextStatus = 'APPROVED';
                break;

            case 'RETURN':

                if ($role === 'REVIEWER') {
                    $nextStatus = 'RETURNED';
                } else {
                    // move back to previous stage
                    $previousStatuses = array_flip(self::FLOW);
                    $nextStatus = $previousStatuses[$status] ?? abort(400);
                }

                break;

            case 'REJECT':
                $nextStatus = 'REJECTED';
                break;

            default:
                abort(400, 'Invalid action.');
        }


        /**
         * 💾 UPDATE CONTRACT STATUS
         */
        $contract->update([
            'status' => $nextStatus,
        ]);

        /**
         * 📝 SAVE REMARK (AUDIT TRAIL)
         */
        $contract->remarks()->create([
            'user_id' => $user->id,
            'role'    => $role,
            'action'  => $request->action,
            'remarks' => $request->remarks,
        ]);

        return back()->with(
            'success',
            "Contract successfully {$request->action}."
        );
    }

    public function uploadExecutionDocument(Request $request, Contract $contract)
    {
        // 🔒 Role + Status Guard
        if (
            auth()->user()->role !== 'BRANCH' ||
            $contract->status !== 'APPROVED'
        ) {
            abort(403);
        }

        // ❌ Prevent duplicate upload
        if ($contract->execution_file_path) {
            return back()->withErrors([
                'execution_file' => 'Execution document already uploaded.'
            ]);
        }

        // ✅ Validation
        $request->validate([
            'execution_file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // 📂 Store file
        $path = $request->file('execution_file')
            ->store('contracts/execution', 'public');

        // 💾 Save to contracts table
        $contract->update([
            'execution_file_path' => $path,
            'execution_uploaded_at' => now(),
            'execution_uploaded_by' => auth()->id(),
        ]);

        // 📝 Audit remark
        $contract->remarks()->create([
            'action' => 'execution_uploaded',
            'remarks' => 'Execution document uploaded by branch.',
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Execution document uploaded successfully.');
    }

    public function all(Request $request)
    {
        $user = auth()->user();

        $query = Contract::with(['uploader.branch'])->latest();

        /* ================= FILTER: TRANSACTION NO ================= */
        if ($request->filled('transaction_no')) {
            $query->where(
                'transaction_no',
                'like',
                '%' . $request->transaction_no . '%'
            );
        }

        /* ================= FILTER: CONTRACT STATUS ================= */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        /* ================= FILTER: EXECUTION STATUS ================= */
        if ($request->filled('execution')) {
            if ($request->execution === 'uploaded') {
                $query->whereNotNull('execution_file_path');
            }

            if ($request->execution === 'not_uploaded') {
                $query->whereNull('execution_file_path');
            }
        }

        /* ================= FILTER: BRANCH ================= */
        if ($request->filled('branch_id')) {
            $query->whereHas('uploader', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });
        }

        /* ================= PAGINATE ================= */
        $contracts = $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($contract) => [
                'id' => $contract->id,
                'transaction_no' => $contract->transaction_no,
                'contract_type' => $contract->contract_type,
                'status' => $contract->status,

                // ✅ derived execution status
                'execution_file_path' => $contract->execution_file_path,

                'created_at' => $contract->created_at,
                'uploader' => [
                    'name' => $contract->uploader->name,
                    'branch' => $contract->uploader->branch,
                ],
            ]);

        return Inertia::render('contracts/all', [
            'contracts' => $contracts,

            // ✅ required by frontend filters
            'filters' => $request->only([
                'transaction_no',
                'status',
                'execution',
                'branch_id',
            ]),

            // ✅ branch dropdown source
            'branches' => \App\Models\Branch::select('id', 'name')->get(),
        ]);
    }




}
