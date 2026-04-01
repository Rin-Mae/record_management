<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Simulate the full recordsChecklist endpoint response
$students = \App\Models\User::verifiedStudents()
    ->with('course:id,name')
    ->select('id', 'student_id', 'firstname', 'middlename', 'lastname', 'email', 'course_id')
    ->orderBy('firstname', 'asc')
    ->orderBy('lastname', 'asc')
    ->get();

$recordTypes = \App\Models\RecordType::select('id', 'name')->orderBy('name')->get();
$allRecords = \App\Models\StudentRecord::where('verification_status', 'verified')
    ->select('id', 'user_id', 'record_type', 'created_at')
    ->get();

// Find Mae Ann's data (ID: 2)
$studentChecklists = $students->map(function ($student) use ($recordTypes, $allRecords) {
    $recordsMap = [];
    
    foreach ($recordTypes as $type) {
        $typeRecords = $allRecords->filter(function ($record) use ($student, $type) {
            return $record->user_id === $student->id && $record->record_type === $type->name;
        });
        
        $recordsMap[$type->name] = [
            'count' => $typeRecords->count(),
            'submitted' => $typeRecords->count() > 0,
        ];
    }

    return [
        'id' => $student->id,
        'student_id' => $student->student_id,
        'name' => trim($student->firstname . ' ' . ($student->middlename ? $student->middlename . ' ' : '') . $student->lastname),
        'email' => $student->email,
        'course' => $student->course ? $student->course->name : null,
        'records' => $recordsMap,
    ];
});

// Find Mae Ann
$mae = $studentChecklists->where('id', 2)->first();
echo "Mae Ann's data in checklist response:\n";
echo json_encode($mae, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
