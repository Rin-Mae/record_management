<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecordType extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    protected $casts = [];

    /**
     * Get the student records for this record type.
     */
    public function studentRecords(): HasMany
    {
        return $this->hasMany(StudentRecord::class, 'record_type_id');
    }
}
