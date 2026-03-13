<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollmentList extends Model
{
    protected $fillable = [
        'period',
        'academic_year',
    ];

    public const PERIODS = [
        '1st Semester',
        '2nd Semester',
    ];

    /**
     * The students enrolled in this period.
     */
    public function students()
    {
        return $this->belongsToMany(Student::class, 'enrollment_list_students')
                    ->withTimestamps();
    }
}
