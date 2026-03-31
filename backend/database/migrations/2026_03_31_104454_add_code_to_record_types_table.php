<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if column doesn't exist before adding it
        if (!Schema::hasColumn('record_types', 'code')) {
            Schema::table('record_types', function (Blueprint $table) {
                $table->string('code')->unique()->after('name');
                $table->index('code');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('record_types', 'code')) {
            Schema::table('record_types', function (Blueprint $table) {
                $table->dropIndex(['code']);
                $table->dropColumn('code');
            });
        }
    }
};
