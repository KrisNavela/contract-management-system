<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalDocumentRemark extends Model
{
    protected $fillable = [
        'legal_document_id',
        'user_id',
        'action',
        'remarks',
    ];

    public function legalDocument()
    {
        return $this->belongsTo(LegalDocument::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
