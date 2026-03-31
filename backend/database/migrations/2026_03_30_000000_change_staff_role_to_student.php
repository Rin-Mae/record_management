<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change all users with 'staff' role to 'student'
        DB::table('users')
            ->where('role', 'staff')
            ->update(['role' => 'student']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert all users with 'student' role back to 'staff'
        DB::table('users')
            ->where('role', 'student')
            ->update(['role' => 'staff']);
    }
};
