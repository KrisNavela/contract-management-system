<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_no',
        'contract_type',
        'uploaded_by',
        'status',
        'execution_file_path',
        'execution_uploaded_at',
        'execution_uploaded_by',
    ];


    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    // A contract has many files
    public function files()
    {
        return $this->hasMany(ContractFile::class);
    }

    // A contract has many remarks (approval history)
    public function remarks()
    {
        return $this->hasMany(\App\Models\ContractRemark::class)
            ->latest(); // ensures newest first
    }

    // Who uploaded the contract
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    protected static function booted()
    {
        static::creating(function ($contract) {

            $year = now()->year;

            // Get last transaction for the same year
            $lastTransaction = DB::table('contracts')
                ->whereYear('created_at', $year)
                ->orderByDesc('created_at')
                ->value('transaction_no');

            $nextSequence = 1;

            if ($lastTransaction) {
                $lastNumber = (int) substr($lastTransaction, -5);
                $nextSequence = $lastNumber + 1;
            }

            $contract->transaction_no = sprintf(
                'CT-%d-%05d',
                $year,
                $nextSequence
            );
        });
    }
}
