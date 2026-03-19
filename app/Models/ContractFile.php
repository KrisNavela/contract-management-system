<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContractFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'file_path',
        'file_type',
        'uploaded_by',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
