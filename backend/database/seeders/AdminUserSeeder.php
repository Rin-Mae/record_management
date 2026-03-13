<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the first admin user. Use attribute assignment to avoid
        // mass-assignment issues if `$fillable` isn't updated.
        $user = new User();
        $user->firstname = 'Mae';
        $user->lastname = 'Gante';
        $user->username = 'maegante';
        $user->email = 'mae@example.com';
        $user->password = bcrypt('mae123');
        $user->role = 'admin';
        // Fill other required fields with sensible defaults for tests.
        $user->middlename = null;
        $user->age = 25;
        $user->birthdate = '2000-01-01';
        $user->address = 'Not set';
        $user->contact_number = 0;
        $user->gender = 'Not specified';

        $user->save();
    }
}