<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'firstname',
        'middlename',
        'lastname',
        'email',
        'age',
        'birthdate',
        'address',
        'contact_number',
        'gender',
        'course',
        'year_level',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'birthdate' => 'date',
        'age' => 'integer',
        'year_level' => 'integer',
    ];

    /**
     * Get the user account associated with this student.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the records for the student through their user account.
     */
    public function records()
    {
        return $this->user()->hasMany(StudentRecord::class, 'user_id');
    }

    /**
     * Scope for searching students by various fields.
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
            $q->where('student_id', 'like', $searchPattern)
              ->orWhere('firstname', 'like', $searchPattern)
              ->orWhere('lastname', 'like', $searchPattern)
              ->orWhere('middlename', 'like', $searchPattern)
              ->orWhere('email', 'like', $searchPattern)
              ->orWhere('course', 'like', $searchPattern);
        });
    }

    /**
     * Scope for filtering by course.
     */
    public function scopeByCourse($query, $courseCode)
    {
        if (!$courseCode) {
            return $query;
        }

        return $query->where('course', $courseCode);
    }

    /**
     * Scope for filtering by year level.
     */
    public function scopeByYearLevel($query, $yearLevel)
    {
        if (!$yearLevel) {
            return $query;
        }

        return $query->where('year_level', $yearLevel);
    }
}