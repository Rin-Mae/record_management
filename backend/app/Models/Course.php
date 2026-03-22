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
     * Get the students that have this course.
     */
    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
