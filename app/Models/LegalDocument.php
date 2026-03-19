<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class LegalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_no',
        'title',
        'description',
        'department_id',
        'created_by',
        'status',
        'execution_file_path',
        'execution_uploaded_at',
        'execution_uploaded_by',
    ];

    /* ================= RELATIONSHIPS ================= */

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function files()
    {
        return $this->hasMany(LegalDocumentFile::class);
    }

    public function remarks()
    {
        return $this->hasMany(LegalDocumentRemark::class)->latest();
    }

    public function executionUploader()
    {
        return $this->belongsTo(User::class, 'execution_uploaded_by');
    }

    protected static function booted()
    {
        static::creating(function ($document) {

            $year = now()->year;

            // Get last reference for the same year
            $lastReference = DB::table('legal_documents')
                ->whereYear('created_at', $year)
                ->orderByDesc('created_at')
                ->value('reference_no');

            $nextSequence = 1;

            if ($lastReference) {
                // Expected format: LD-YYYY-00001
                $lastNumber = (int) substr($lastReference, -5);
                $nextSequence = $lastNumber + 1;
            }

            // Format: LD-YYYY-00001
            $document->reference_no = sprintf(
                'LD-%d-%05d',
                $year,
                $nextSequence
            );
        });
    }
}

