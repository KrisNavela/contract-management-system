<?php

namespace App\Models;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/* ================= MODELS ================= */

use App\Models\Branch;
use App\Models\Department;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /* ================= MASS ASSIGNMENT ================= */

    protected $fillable = [
        'name',
        'email',
        'password',

        // CONTRACT APPROVAL ROLE
        'role',

        // LEGAL DOCUMENT ROLE
        'legal_role',

        // RELATIONS
        'branch_id',
        'department_id',
    ];

    /* ================= HIDDEN ================= */

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /* ================= CASTS ================= */

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Automatically hash password when setting
     */
    protected function password(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                return Hash::needsRehash($value)
                    ? Hash::make($value)
                    : $value;
            },
        );
    }

    /* ================= RELATIONSHIPS ================= */

    /**
     * Contract workflow (Branch)
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Legal workflow (Department)
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function contracts()
    {
        return $this->hasMany(\App\Models\Contract::class, 'uploaded_by');
    }

    /* ================= HELPERS ================= */

    /**
     * Contract approval helpers
     */
    public function isContractAdmin(): bool
    {
        return $this->role === 'ADMIN';
    }

    public function isContractApprover(): bool
    {
        return in_array($this->role, [
            'INITIAL_APPROVER',
            'FINAL_APPROVER',
        ]);
    }

    /**
     * Legal document helpers
     */
    public function isLegalOfficer(): bool
    {
        return $this->legal_role === 'LEGAL_OFFICER';
    }

    public function isDepartmentHead(): bool
    {
        return $this->legal_role === 'DEPARTMENT_HEAD';
    }
}
