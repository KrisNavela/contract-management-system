<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Branch;
use App\Models\Department;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Show user management page
     */
    public function index()
    {
        return inertia('users/index', [
            'users' => User::with(['branch', 'department'])->get(),
            'branches' => Branch::all(),
            'departments' => Department::all(),
        ]);
    }
    //public function index()
    //{
    //    dd('USERS INDEX HIT');
    //}
    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user)
    {
        // Prevent changing own role
        if ($request->user()->id === $user->id) {
            abort(403, 'You cannot change your own role.');
        }

        $data = $request->validate([
            'role' => [
                'nullable', // ✅ allow empty
                'in:BRANCH,REVIEWER,INITIAL_VERIFIER,FINAL_VERIFIER,INITIAL_APPROVER,FINAL_APPROVER,ADMIN',
            ],
        ]);

        $user->update([
            'role' => $data['role'] ?: null, // ✅ convert "" to null
        ]);

        return back()->with('success', 'Contract role updated.');
    }


    /**
     * Update user branch
     */
    public function updateBranch(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            abort(403, 'You cannot change your own branch.');
        }

        $data = $request->validate([
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $user->update([
            'branch_id' => $data['branch_id'],
        ]);

        return back()->with('success', 'User branch updated.');
    }

    /**
     * Update user department
     */
    public function updateDepartment(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            abort(403, 'You cannot change your own department.');
        }

        $data = $request->validate([
            'department_id' => ['nullable', 'exists:departments,id'],
        ]);

        $user->update([
            'department_id' => $data['department_id'],
        ]);

        return back()->with('success', 'User department updated.');
    }

    public function updateLegalRole(Request $request, User $user)
    {
        $data = $request->validate([
            'legal_role' => [
                'nullable',
                'in:USER,DEPARTMENT_HEAD,LEGAL_OFFICER',
            ],
        ]);

        $user->update([
            'legal_role' => $data['legal_role'],
        ]);

        return back()->with('success', 'Legal role updated.');
    }
}
