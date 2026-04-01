<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$records = \App\Models\StudentRecord::where('verification_status', 'verified')->orderBy('created_at')->get();
echo "Total verified records: " . count($records) . "\n";
echo "=====================\n";
foreach($records as $r) {
    echo "ID: {$r->id} | Type: {$r->record_type} | Created: {$r->created_at} | Status: {$r->verification_status}\n";
}
