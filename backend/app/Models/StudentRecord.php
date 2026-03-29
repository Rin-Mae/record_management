<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentRecord extends Model
{
    use HasFactory, SoftDeletes;

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
    ];

    /**
     * Record types that use simplified form (student + files only).
     * All types now use this form.
     */
    public const SIMPLIFIED_TYPES = [
        'tor', 'special-order', 'psa', 'comprehensive-exam', 'diploma',
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

    /**
     * Scope for searching records by various fields including related student.
     */
    public function scopeSearch($query, $searchTerm)
    {
        if (!$searchTerm) {
            return $query;
        }

        // Normalize search term
        $searchTerm = trim($searchTerm);
        $searchPattern = "%{$searchTerm}%";

        return $query->where(function ($q) use ($searchPattern) {
            $q->where('title', 'like', $searchPattern)
              ->orWhere('description', 'like', $searchPattern)
              ->orWhere('file_name', 'like', $searchPattern)
              ->orWhereHas('student', function ($sq) use ($searchPattern) {
                  $sq->where('firstname', 'like', $searchPattern)
                    ->orWhere('lastname', 'like', $searchPattern)
                    ->orWhere('student_id', 'like', $searchPattern);
              });
        });
    }

    /**
     * Scope for filtering by student's course.
     */
    public function scopeByCourse($query, $courseCode)
    {
        if (!$courseCode) {
            return $query;
        }

        return $query->whereHas('student', function ($q) use ($courseCode) {
            $q->where('course', $courseCode);
        });
    }
}