<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed the initial admin user for authentication tests.
        $this->call([
            CourseSeeder::class,
            RecordTypeSeeder::class,
            AdminUserSeeder::class,
            StudentSeeder::class,
        ]);
    }
}