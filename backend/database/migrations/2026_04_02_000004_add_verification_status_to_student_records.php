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
        Schema::table('student_records', function (Blueprint $table) {
            // Add verification status field
            if (!Schema::hasColumn('student_records', 'verification_status')) {
                $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending')->after('description');
            }
            // Add verified by field to track which admin verified it
            if (!Schema::hasColumn('student_records', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')->after('verification_status');
            }
            // Add verification remarks
            if (!Schema::hasColumn('student_records', 'verification_remarks')) {
                $table->text('verification_remarks')->nullable()->after('verified_by');
            }
            // Add verification date
            if (!Schema::hasColumn('student_records', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verification_remarks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_records', function (Blueprint $table) {
            if (Schema::hasColumn('student_records', 'verification_status')) {
                $table->dropColumn('verification_status');
            }
            if (Schema::hasColumn('student_records', 'verified_by')) {
                $table->dropForeign(['verified_by']);
                $table->dropColumn('verified_by');
            }
            if (Schema::hasColumn('student_records', 'verification_remarks')) {
                $table->dropColumn('verification_remarks');
            }
            if (Schema::hasColumn('student_records', 'verified_at')) {
                $table->dropColumn('verified_at');
            }
        });
    }
};
