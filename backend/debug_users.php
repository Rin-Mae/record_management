<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$records = \App\Models\StudentRecord::where('verification_status', 'verified')->orderBy('created_at')->get();
echo "Checking who submitted the 7 verified records:\n";
echo "=============================================\n";
foreach($records as $r) {
    $user = \App\Models\User::find($r->user_id);
    $adminVerified = $user->is_admin_verified ? 'YES' : 'NO';
    echo "Record ID: {$r->id} | User: {$user->firstname} {$user->lastname} | Admin Verified: {$adminVerified}\n";
}
