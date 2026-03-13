<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentRecord extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'record_type',
        'title',
        'description',
        'record_date',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'remarks',
    ];

    /**
     * Valid record types.
     */
    public const RECORD_TYPES = [
        'tor' => 'Transcript of Records',
        'special-order' => 'Special Order',
        'psa' => 'PSA',
        'comprehensive-exam' => 'Comprehensive Exam',
        'diploma' => 'Diploma',
        'enrollment-list' => 'Enrollment List',
    ];

    /**
     * Record types that use simplified form (student + files only).
     * All types now use this form.
     */
    public const SIMPLIFIED_TYPES = [
        'tor', 'special-order', 'psa', 'comprehensive-exam', 'diploma', 'enrollment-list',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'record_date' => 'date',
    ];

    /**
     * Get the student that owns the record.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the files for the record.
     */
    public function files()
    {
        return $this->hasMany(RecordFile::class, 'student_record_id');
    }

    /**
     * Check if this record type uses simplified form.
     */
    public static function isSimplifiedType($type)
    {
        return in_array($type, self::SIMPLIFIED_TYPES);
    }
}
