<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalDocumentFile extends Model
{
    protected $fillable = [
        'legal_document_id',
        'file_path',
        'file_name',
        'file_type',
    ];

    public function legalDocument()
    {
        return $this->belongsTo(LegalDocument::class);
    }
}
