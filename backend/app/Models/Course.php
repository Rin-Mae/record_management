<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'department',
        'description',
    ];

    /**
     * Get the students (users) that have this course.
     */
    public function students()
    {
        return $this->hasMany(User::class, 'course_id');
    }

    /**
     * Scope for searching courses by various fields.
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
            $q->where('code', 'like', $searchPattern)
              ->orWhere('name', 'like', $searchPattern)
              ->orWhere('department', 'like', $searchPattern)
              ->orWhere('description', 'like', $searchPattern);
        });
    }

    /**
     * Scope for filtering by department.
     */
    public function scopeByDepartment($query, $department)
    {
        if (!$department) {
            return $query;
        }

        return $query->where('department', $department);
    }
}
