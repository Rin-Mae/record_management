<?php

namespace Database\Seeders;

use App\Models\RecordType;
use Illuminate\Database\Seeder;

class RecordTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recordTypes = [
            [
                'name' => 'Birth Certificate',
                'description' => 'Birth certificate document',
            ],
            [
                'name' => 'Marriage Certificate',
                'description' => 'Marriage certificate document',
            ],
            [
                'name' => 'Transcript of Records',
                'description' => 'Official transcript of academic records',
            ],
            [
                'name' => 'Comprehensive Exam',
                'description' => 'Comprehensive examination documents',
            ],
        ];

        foreach ($recordTypes as $type) {
            RecordType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
