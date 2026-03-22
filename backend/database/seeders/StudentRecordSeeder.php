<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\StudentRecord;
use App\Models\RecordFile;
use Illuminate\Database\Seeder;

class StudentRecordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recordTypes = ['tor', 'special-order', 'psa', 'comprehensive-exam', 'diploma'];
        
        // Get the first 50 students to create records for
        $students = Student::limit(50)->get();

        foreach ($students as $student) {
            // Create 1-3 random records for each student
            $recordCount = rand(1, 3);
            
            for ($i = 0; $i < $recordCount; $i++) {
                $recordType = $recordTypes[array_rand($recordTypes)];
                
                $record = StudentRecord::create([
                    'student_id' => $student->id,
                    'record_type' => $recordType,
                    'title' => $this->generateTitle($recordType),
                    'description' => $this->generateDescription($recordType),
                    'record_date' => now()->subDays(rand(1, 365)),
                    'file_path' => null,
                    'file_name' => null,
                    'file_type' => null,
                    'file_size' => null,
                    'remarks' => $this->generateRemarks(),
                ]);

                // Create 1-3 files for each record
                $fileCount = rand(1, 3);
                for ($j = 0; $j < $fileCount; $j++) {
                    RecordFile::create([
                        'student_record_id' => $record->id,
                        'file_path' => "student_records/{$student->id}/sample_file_${i}_${j}.pdf",
                        'file_name' => "Document_" . ($j + 1) . ".pdf",
                        'file_type' => 'application/pdf',
                        'file_size' => rand(100000, 5000000),
                    ]);
                }
            }
        }

        $this->command->info('StudentRecord seeder completed. Created records for ' . count($students) . ' students.');
    }

    private function generateTitle($recordType): string
    {
        $titles = [
            'tor' => [
                'Official Transcript of Records',
                'Academic Transcript',
                'Student Transcript - First Semester',
                'Student Transcript - Second Semester',
                'Cumulative Transcript of Records',
            ],
            'special-order' => [
                'Special Order for Scholarship',
                'Special Order - Request for Credentials',
                'Special Order - Graduation Waiver',
                'Special Order for Extra Load',
            ],
            'psa' => [
                'PSA Birth Certificate',
                'PSA Marriage Certificate',
                'PSA Divorce Certificate',
            ],
            'comprehensive-exam' => [
                'Comprehensive Examination Result',
                'Graduate Comprehensive Exam',
                'Doctoral Comprehensive Exam',
            ],
            'diploma' => [
                'Official Diploma Certificate',
                'Bachelor Degree Diploma',
                'Master Degree Diploma',
            ],
        ];

        $typeArray = $titles[$recordType] ?? ['Document'];
        return $typeArray[array_rand($typeArray)];
    }

    private function generateDescription($recordType): string
    {
        $descriptions = [
            'tor' => 'Official transcript of academic records and grades',
            'special-order' => 'Special administrative order for student request',
            'psa' => 'Government-issued civil registration document',
            'comprehensive-exam' => 'Results of comprehensive examination',
            'diploma' => 'Official degree diploma issued by the university',
        ];

        return $descriptions[$recordType] ?? 'Official document';
    }

    private function generateRemarks(): string
    {
        $remarks = [
            'Document verified and authenticated',
            'Original copy on file',
            'Certified true copy',
            'For authentication purposes',
            'Official copy released to student',
            'Scanned copy archived',
        ];

        return $remarks[array_rand($remarks)];
    }
}
