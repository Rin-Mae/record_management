<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollment_lists', function (Blueprint $table) {
            $table->id();
            $table->enum('period', ['1st Semester', '2nd Semester']);
            $table->string('academic_year'); // e.g. "2025-2026"
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['period', 'academic_year']);
        });

        Schema::create('enrollment_list_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_list_id')->constrained('enrollment_lists')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['enrollment_list_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollment_list_students');
        Schema::dropIfExists('enrollment_lists');
    }
};
