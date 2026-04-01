<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('firstname', 'Mae Ann Isabelle')->first();
if ($user) {
    echo "User Details:\n";
    echo "ID: {$user->id}\n";
    echo "Name: {$user->firstname} {$user->lastname}\n";
    echo "Student ID: {$user->student_id}\n";
    echo "Role: {$user->role}\n";
    echo "Admin Verified: " . ($user->is_admin_verified ? 'YES' : 'NO') . "\n";
    echo "Course ID: " . ($user->course_id ?? 'NULL') . "\n";
    
    if ($user->course_id) {
        $course = $user->course;
        echo "Course Name: {$course->name}\n";
    } else {
        echo "Course Name: (no course assigned)\n";
    }
    
    echo "\nRecords count: " . $user->studentRecords()->count() . "\n";
    echo "Verified records count: " . $user->studentRecords()->where('verification_status', 'verified')->count() . "\n";
} else {
    echo "User not found\n";
}
