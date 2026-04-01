<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check if student is in the verifiedStudents() list
$verifiedStudents = \App\Models\User::verifiedStudents()->get();
$maeFound = $verifiedStudents->where('id', 2)->first();

echo "Is Mae Ann Isabelle in verifiedStudents list? " . ($maeFound ? 'YES' : 'NO') . "\n";

if ($maeFound) {
    echo "\nStudent should appear in records checklist.\n";
    echo "\nChecking what the recordsChecklist endpoint returns...\n";
    
    // Simulate the recordsChecklist query
    $students = \App\Models\User::verifiedStudents()
        ->with('course:id,name')
        ->select('id', 'student_id', 'firstname', 'middlename', 'lastname', 'email', 'course_id')
        ->orderBy('firstname', 'asc')
        ->orderBy('lastname', 'asc')
        ->get();
    
    echo "Total verified students in checklist: " . count($students) . "\n";
    foreach ($students as $s) {
        echo "  - {$s->firstname} {$s->lastname} (ID: {$s->id}, Student ID: {$s->student_id})\n";
    }
}
