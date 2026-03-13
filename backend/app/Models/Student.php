<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

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
     * Get the records for the student.
     */
    public function records()
    {
        return $this->hasMany(StudentRecord::class);
    }
}
