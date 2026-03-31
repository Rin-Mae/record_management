<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the old token column
            $table->dropColumn('email_verification_token');
            
            // Add new OTP-related columns
            $table->string('email_verification_otp', 6)->nullable()->after('email_verified_at');
            $table->timestamp('otp_expires_at')->nullable()->after('email_verification_otp');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert to the old token column
            $table->string('email_verification_token', 255)->nullable()->after('email_verified_at');
            
            // Remove OTP columns
            $table->dropColumn(['email_verification_otp', 'otp_expires_at']);
        });
    }
};
