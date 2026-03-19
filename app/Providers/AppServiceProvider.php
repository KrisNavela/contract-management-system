<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Contract;
use App\Models\LegalDocument;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Inertia::share([

            /* =====================================================
             | Bell Count (Contracts + Legal)
             ===================================================== */
            'pendingApprovalCount' => function () {
                $user = Auth::user();

                if (! $user) {
                    return 0;
                }

                $count = 0;

                /* ================= CONTRACTS ================= */
                $contractRoleStatusMap = [
                    'REVIEWER' => [
                        'SUBMITTED',
                    ],
                    'INITIAL_VERIFIER' => [
                        'REVIEWED',
                    ],
                    'FINAL_VERIFIER' => [
                        'INITIAL_VERIFICATION',
                    ],
                    'INITIAL_APPROVER' => [
                        'FINAL_VERIFICATION',
                    ],
                    'FINAL_APPROVER' => [
                        'INITIAL_APPROVAL',
                    ],
                ];

                if (isset($contractRoleStatusMap[$user->role])) {
                    $count += Contract::whereIn(
                        'status',
                        $contractRoleStatusMap[$user->role]
                    )->count();
                }

                /* ================= LEGAL ================= */
                if ($user->legal_role === 'DEPARTMENT_HEAD') {
                    $count += LegalDocument::where('status', 'SUBMITTED')
                        ->where('department_id', $user->department_id)
                        ->count();
                } elseif ($user->legal_role === 'LEGAL_OFFICER') {
                    $count += LegalDocument::where('status', 'DEPARTMENT_APPROVED')
                        ->count();
                }

                return $count;
            },

            /* =====================================================
             | Bell Dropdown Items (Contracts + Legal)
             ===================================================== */
            'pendingApprovals' => function () {
                $user = Auth::user();

                if (! $user) {
                    return [];
                }

                $items = [];

                /* ================= CONTRACTS ================= */
                $contractRoleStatusMap = [
                    'REVIEWER' => [
                        'SUBMITTED',
                    ],
                    'INITIAL_VERIFIER' => [
                        'REVIEWED',
                    ],
                    'FINAL_VERIFIER' => [
                        'INITIAL_VERIFICATION',
                    ],
                    'INITIAL_APPROVER' => [
                        'FINAL_VERIFICATION',
                    ],
                    'FINAL_APPROVER' => [
                        'INITIAL_APPROVAL',
                    ],
                ];

                if (isset($contractRoleStatusMap[$user->role])) {
                    $contracts = Contract::whereIn(
                        'status',
                        $contractRoleStatusMap[$user->role]
                    )
                        ->latest()
                        ->limit(5)
                        ->get()
                        ->map(fn ($c) => [
                            'type' => 'contract',
                            'id' => $c->id,
                            'title' => $c->transaction_no,
                            'created_at' => $c->created_at->diffForHumans(),
                            'created_at_raw' => $c->created_at,
                            'url' => "/contracts/{$c->id}",
                        ])
                        ->toArray();

                    $items = array_merge($items, $contracts);
                }

                /* ================= LEGAL ================= */
                if ($user->legal_role === 'DEPARTMENT_HEAD') {
                    $legals = LegalDocument::where('status', 'SUBMITTED')
                        ->where('department_id', $user->department_id)
                        ->latest()
                        ->limit(5)
                        ->get()
                        ->map(fn ($d) => [
                            'type' => 'legal',
                            'id' => $d->id,
                            'title' => $d->reference_no,
                            'created_at' => $d->created_at->diffForHumans(),
                            'created_at_raw' => $d->created_at,
                            'url' => "/legal-documents/{$d->id}",
                        ])
                        ->toArray();

                    $items = array_merge($items, $legals);
                }

                if ($user->legal_role === 'LEGAL_OFFICER') {
                    $legals = LegalDocument::where('status', 'DEPARTMENT_APPROVED')
                        ->latest()
                        ->limit(5)
                        ->get()
                        ->map(fn ($d) => [
                            'type' => 'legal',
                            'id' => $d->id,
                            'title' => $d->reference_no,
                            'created_at' => $d->created_at->diffForHumans(),
                            'created_at_raw' => $d->created_at,
                            'url' => "/legal-documents/{$d->id}",
                        ])
                        ->toArray();

                    $items = array_merge($items, $legals);
                }

                return collect($items)
                    ->sortByDesc('created_at_raw')
                    ->take(8)
                    ->values();
            },

            /* =====================================================
             | Dashboard Counts (Contracts Only – unchanged)
             ===================================================== */
            'dashboardCounts' => function () {
                $user = Auth::user();

                if (! $user) {
                    return [
                        'submitted' => 0,
                        'pending' => 0,
                        'approved' => 0,
                        'returned' => 0,
                        'total' => 0,
                    ];
                }

                /* ================= BRANCH ================= */
                if ($user->role === 'BRANCH') {
                    return [
                        'submitted' => Contract::where('uploaded_by', $user->id)->count(),
                        'pending' => Contract::where('uploaded_by', $user->id)
                            ->whereNotIn('status', ['APPROVED', 'REJECTED'])
                            ->count(),
                        'approved' => Contract::where('uploaded_by', $user->id)
                            ->where('status', 'APPROVED')
                            ->count(),
                        'returned' => Contract::where('uploaded_by', $user->id)
                            ->where('status', 'RETURNED')
                            ->count(),
                        'total' => Contract::count(),
                    ];
                }

                /* ================= APPROVERS ================= */
                $roleStatusMap = [
                    'REVIEWER'         => ['SUBMITTED'],
                    'INITIAL_VERIFIER' => ['REVIEWED'],
                    'FINAL_VERIFIER'   => ['INITIAL_VERIFICATION'],
                    'INITIAL_APPROVER' => ['FINAL_VERIFICATION'],
                    'FINAL_APPROVER'   => ['INITIAL_APPROVAL'],
                ];

                if (isset($roleStatusMap[$user->role])) {
                    return [
                        'submitted' => 0,
                        'pending' => Contract::whereIn('status', $roleStatusMap[$user->role])->count(),
                        'approved' => Contract::where('status', 'APPROVED')->count(),
                        'returned' => Contract::where('status', 'RETURNED')->count(),
                        'total' => Contract::count(),
                    ];
                }

                /* ================= ADMIN ================= */
                if ($user->role === 'ADMIN') {
                    return [
                        'submitted' => 0,
                        'pending' => Contract::whereNotIn('status', ['APPROVED', 'REJECTED'])->count(),
                        'approved' => Contract::where('status', 'APPROVED')->count(),
                        'returned' => Contract::where('status', 'RETURNED')->count(),
                        'total' => Contract::count(),
                    ];
                }

                return [
                    'submitted' => 0,
                    'pending' => 0,
                    'approved' => 0,
                    'returned' => 0,
                    'total' => 0,
                ];
            },
        ]);
    }
}
