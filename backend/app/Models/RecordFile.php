<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RecordFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_record_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    /**
     * Get the student record that owns this file.
     */
    public function studentRecord()
    {
        return $this->belongsTo(StudentRecord::class);
    }
}