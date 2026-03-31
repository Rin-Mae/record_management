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
            // Add foreign key for record type
            $table->foreignId('record_type_id')
                ->nullable()
                ->after('record_type')
                ->constrained('record_types')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_records', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['record_type_id']);
            $table->dropColumn('record_type_id');
        });
    }
};
