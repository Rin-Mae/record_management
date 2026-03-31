<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add suffix column if it doesn't exist
            if (!Schema::hasColumn('users', 'suffix')) {
                $table->string('suffix', 50)->nullable()->after('lastname');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'suffix')) {
                $table->dropColumn('suffix');
            }
        });
    }
};
