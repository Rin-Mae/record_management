<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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

    protected $appends = ['file_url'];

    /**
     * Get the student record that owns this file.
     */
    public function studentRecord()
    {
        return $this->belongsTo(StudentRecord::class);
    }

    /**
     * Get the file URL as an accessor.
     */
    protected function fileUrl(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => asset('storage/' . $this->file_path)
        );
    }
}