<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class StaffUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'John Staff',
                'password' => bcrypt('staff123'),
                'roles' => ['staff'],
            ],
        );

        User::firstOrCreate(
            ['email' => 'staff2@example.com'],
            [
                'name' => 'Jane Staff',
                'password' => bcrypt('staff123'),
                'roles' => ['staff'],
            ],
        );

        User::firstOrCreate(
            ['email' => 'staff3@example.com'],
            [
                'name' => 'Bob Staff',
                'password' => bcrypt('staff123'),
                'roles' => ['staff'],
            ],
        );
    }
}
