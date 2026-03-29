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
            // Add indexes on commonly searched columns for better query performance
            $table->index('title');
            $table->index('file_name');
            $table->index(['record_type', 'student_id']);
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_records', function (Blueprint $table) {
            $table->dropIndex(['title']);
            $table->dropIndex(['file_name']);
            $table->dropIndex(['record_type', 'student_id']);
            $table->dropIndex(['student_id']);
        });
    }
};
