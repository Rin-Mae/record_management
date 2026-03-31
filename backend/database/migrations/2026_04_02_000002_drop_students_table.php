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
        Schema::dropIfExists('students');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->unique();
            $table->string('firstname');
            $table->string('middlename')->nullable();
            $table->string('lastname');
            $table->string('email')->unique();
            $table->integer('age')->nullable();
            $table->date('birthdate')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('course')->nullable();
            $table->integer('year_level')->nullable();
            $table->enum('status', ['active', 'inactive', 'graduated', 'dropped'])->default('active');
            $table->softDeletes();
            $table->timestamps();
        });
    }
};
