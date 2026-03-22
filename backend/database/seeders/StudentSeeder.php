<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // All available course codes matching the frontend courseConfig
        $courses = [
            // Basic Education
            'ELEM', 'JHS', 'SHS-ABM', 'SHS-STEM', 'SHS-HUMSS', 'SHS-HE', 'SHS-ICT',
            // College
            'BSGE', 'BSA', 'BEEd', 'BSEd', 'BSEd-Math', 'BSEd-English', 'BSEd-Filipino', 'BSEd-Science',
            'BSCrim', 'BSN', 'AB-PolSci', 'AB-English', 'ABCom',
            'BSBA', 'BSBA-FM', 'BSBA-MM', 'BSBA-HRM', 'BSMA',
            'BSIT', 'BSHM',
            // Graduate
            'Ph.D', 'Ed.D', 'MA.Ed', 'MA.Ed-LL', 'MPA', 'MBA',
        ];

        // Filipino first names
        $firstNames = [
            'Juan', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Sofia', 'Miguel', 'Isabella',
            'Gabriel', 'Camila', 'Rafael', 'Valentina', 'Andres', 'Lucia', 'Diego',
            'Elena', 'Mateo', 'Victoria', 'Sebastian', 'Gabriela', 'Nicolas', 'Mariana',
            'Alejandro', 'Daniela', 'Fernando', 'Natalia', 'Emilio', 'Catalina', 'Ricardo',
            'Adriana', 'Manuel', 'Renata', 'Eduardo', 'Fernanda', 'Antonio', 'Paula',
            'Roberto', 'Carolina', 'Francisco', 'Beatriz', 'Javier', 'Teresa', 'Marco',
            'Angela', 'Luis', 'Patricia', 'Jose', 'Carmen', 'Ramon', 'Rosa',
        ];

        // Filipino middle names
        $middleNames = [
            'Dela', 'Santos', 'Reyes', 'Lim', 'Tan', 'Go', 'Ong', 'Sy', 'Chua', 'Lee',
            'Ang', 'Co', 'Yu', 'Cruz', 'Garcia', 'Lopez', 'Ramos', 'Torres', 'Flores',
            'Rivera', 'Gonzales', 'Bautista', 'Aquino', 'Castillo', 'Soriano', 'Fernandez',
        ];

        // Filipino last names
        $lastNames = [
            'Cruz', 'Garcia', 'Santos', 'Reyes', 'Mendoza', 'Ramos', 'Torres', 'Flores',
            'Rivera', 'Gonzales', 'Villanueva', 'Bautista', 'Aquino', 'Castillo', 'Soriano',
            'Fernandez', 'Dela Rosa', 'Mercado', 'Navarro', 'Aguilar', 'Salazar', 'Espinoza',
            'Morales', 'Jimenez', 'Vargas', 'Romero', 'Herrera', 'Medina', 'Fuentes', 'Ortega',
            'Castro', 'Delgado', 'Perez', 'Gutierrez', 'Miranda', 'Rojas', 'Serrano', 'Molina',
            'Valdez', 'Campos', 'Leon', 'Sandoval', 'Domingo', 'Santiago', 'Pascual', 'Dizon',
        ];

        // Addresses
        $streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Ave', 'Willow St', 'Spruce Rd', 'Aspen Way'];
        $cities = ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong', 'Paranaque', 'Las Pinas', 'Muntinlupa', 'Caloocan', 'Valenzuela', 'Malabon', 'Navotas', 'Pasay', 'San Juan', 'Marikina'];

        $genders = ['male', 'female'];

        $students = [];
        $usedEmails = [];
        $usedStudentIds = [];

        // Generate students for different enrollment years
        $enrollmentYears = [20, 21, 22, 23, 24, 25, 26]; // 2020 to 2026

        foreach ($courses as $course) {
            // Generate 3-8 students per course
            $studentCount = rand(3, 8);
            
            for ($i = 0; $i < $studentCount; $i++) {
                $firstName = $firstNames[array_rand($firstNames)];
                $middleName = $middleNames[array_rand($middleNames)];
                $lastName = $lastNames[array_rand($lastNames)];
                
                // Generate unique email
                $emailBase = strtolower($firstName . '.' . str_replace(' ', '', $lastName));
                $email = $emailBase . '@email.com';
                $emailCounter = 1;
                while (in_array($email, $usedEmails)) {
                    $email = $emailBase . $emailCounter . '@email.com';
                    $emailCounter++;
                }
                $usedEmails[] = $email;

                // Generate student ID: YY + 6 random digits (total 8 digits)
                $enrollmentYear = $enrollmentYears[array_rand($enrollmentYears)];
                do {
                    $randomPart = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                    $studentId = $enrollmentYear . $randomPart;
                } while (in_array($studentId, $usedStudentIds));
                $usedStudentIds[] = $studentId;

                // Calculate age and birthdate based on enrollment year and course level
                $currentYear = 2026;
                $enrollFullYear = 2000 + $enrollmentYear;
                $yearsEnrolled = $currentYear - $enrollFullYear;
                
                // Determine year level based on course type and years enrolled
                if (in_array($course, ['ELEM'])) {
                    $yearLevel = min($yearsEnrolled + 1, 6);
                    $baseAge = 6;
                } elseif (in_array($course, ['JHS'])) {
                    $yearLevel = min($yearsEnrolled + 1, 4);
                    $baseAge = 12;
                } elseif (str_starts_with($course, 'SHS')) {
                    $yearLevel = min($yearsEnrolled + 1, 2);
                    $baseAge = 16;
                } elseif (in_array($course, ['Ph.D', 'Ed.D', 'MA.Ed', 'MA.Ed-LL', 'MPA', 'MBA'])) {
                    $yearLevel = min($yearsEnrolled + 1, 3);
                    $baseAge = 24;
                } else {
                    // College courses
                    $yearLevel = min($yearsEnrolled + 1, 4);
                    $baseAge = 18;
                }

                $age = $baseAge + $yearsEnrolled + rand(0, 2);
                $birthYear = $currentYear - $age;
                $birthMonth = str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT);
                $birthDay = str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT);
                $birthdate = "$birthYear-$birthMonth-$birthDay";

                $streetNum = rand(100, 999);
                $street = $streets[array_rand($streets)];
                $city = $cities[array_rand($cities)];
                $address = "$streetNum $street, $city";

                $contactNumber = '09' . rand(10, 99) . rand(1000000, 9999999);

                $students[] = [
                    'student_id' => $studentId,
                    'firstname' => $firstName,
                    'middlename' => $middleName,
                    'lastname' => $lastName,
                    'email' => $email,
                    'age' => $age,
                    'birthdate' => $birthdate,
                    'address' => $address,
                    'contact_number' => $contactNumber,
                    'gender' => $genders[array_rand($genders)],
                    'course' => $course,
                    'year_level' => $yearLevel,
                ];
            }
        }

        // Shuffle to randomize order
        shuffle($students);

        foreach ($students as $student) {
            Student::create($student);
        }

        $this->command->info('Created ' . count($students) . ' students across all courses.');
    }
}
