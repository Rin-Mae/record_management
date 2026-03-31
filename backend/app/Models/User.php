<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

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
        'suffix',
        'email',
        'password',
        'role',
        'age',
        'birthdate',
        'address',
        'contact_number',
        'gender',
        'course_id',
        'status',
        'email_verification_otp',
        'otp_expires_at',
        'email_verified_at',
        'is_admin_verified',
        'verification_rejected_reason',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'password' => 'hashed',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope for searching users by various fields.
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
            $q->where('firstname', 'like', $searchPattern)
              ->orWhere('lastname', 'like', $searchPattern)
              ->orWhere('email', 'like', $searchPattern)
              ->orWhere('username', 'like', $searchPattern);
        });
    }

    /**
     * Scope for filtering verified students.
     */
    public function scopeVerifiedStudents($query)
    {
        return $query->where('role', 'student')
            ->where('is_admin_verified', true);
    }

    /**
     * Scope for filtering unverified students.
     */
    public function scopeUnverifiedStudents($query)
    {
        return $query->where('role', 'student')
            ->where('is_admin_verified', false);
    }
}