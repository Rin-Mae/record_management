<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop and recreate the email_verification_token column without unique constraint
            if (Schema::hasColumn('users', 'email_verification_token')) {
                // Check if unique constraint exists and drop it
                try {
                    $table->dropUnique(['email_verification_token']);
                } catch (\Exception $e) {
                    // Constraint might not exist, that's ok
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is one-way - removing the unique constraint
    }
};
