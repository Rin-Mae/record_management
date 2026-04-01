<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get Mae Ann's records (ID: 2) with detailed file info
$mae = \App\Models\User::find(2);
$records = \App\Models\StudentRecord::where('user_id', 2)
    ->where('verification_status', 'verified')
    ->orderBy('created_at')
    ->get();

echo "Mae Ann's Records with Files:\n";
echo "=============================\n";
$totalFiles = 0;
foreach ($records as $record) {
    $fileCount = $record->files()->count();
    $totalFiles += $fileCount;
    echo "Record ID: {$record->id} | Type: {$record->record_type} | Files: {$fileCount}\n";
}
echo "\nTotal files across " . count($records) . " records: {$totalFiles}\n";
