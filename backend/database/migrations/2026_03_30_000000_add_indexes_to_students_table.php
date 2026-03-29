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
        Schema::table('students', function (Blueprint $table) {
            // Add indexes on commonly searched columns for faster lookups
            $table->index('firstname');
            $table->index('lastname');
            $table->index('student_id');
            $table->index('email');
            $table->index('course');
            $table->index('year_level');
            // Compound index for common filter combinations
            $table->index(['course', 'year_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['firstname']);
            $table->dropIndex(['lastname']);
            $table->dropIndex(['student_id']);
            $table->dropIndex(['email']);
            $table->dropIndex(['course']);
            $table->dropIndex(['year_level']);
            $table->dropIndex(['course', 'year_level']);
        });
    }
};
