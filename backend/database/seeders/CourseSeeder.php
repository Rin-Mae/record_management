<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            // Basic Education Center
            ['code' => 'ELEM', 'name' => 'Elementary School', 'department' => 'Basic Education Center', 'description' => 'Elementary school level'],
            ['code' => 'JHS', 'name' => 'Junior Highschool', 'department' => 'Basic Education Center', 'description' => 'Junior high school level'],
            
            // Senior Highschool - Academic Track
            ['code' => 'SHS-ABM', 'name' => 'Accountancy and Business Management (ABM)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool ABM Track'],
            ['code' => 'SHS-STEM', 'name' => 'Science Technology Engineering and Mathematics (STEM)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool STEM Track'],
            ['code' => 'SHS-HUMSS', 'name' => 'Humanities and Social Sciences (HUMSS)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool HUMSS Track'],
            
            // Senior Highschool - Technical and Vocational Track
            ['code' => 'SHS-HE', 'name' => 'Home Economics (HE)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool Home Economics Track'],
            ['code' => 'SHS-ICT', 'name' => 'Information and Communication Technology (ICT)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool ICT Track'],

            // College Degree - Science & Engineering
            ['code' => 'BSGE', 'name' => 'Bachelor of Science in Geodetic Engineering', 'department' => 'College Degree', 'description' => 'Geodetic Engineering degree'],
            
            // College Degree - Business & Accountancy
            ['code' => 'BSA', 'name' => 'Bachelor of Science in Accountancy', 'department' => 'College Degree', 'description' => 'Accountancy degree'],
            ['code' => 'BSBA', 'name' => 'Bachelor of Science in Business Administration', 'department' => 'College Degree', 'description' => 'Business Administration degree'],
            ['code' => 'BSBA-FM', 'name' => 'BSBA - Financial Management', 'department' => 'College Degree', 'description' => 'Business Admin with Financial Management'],
            ['code' => 'BSBA-MM', 'name' => 'BSBA - Marketing Management', 'department' => 'College Degree', 'description' => 'Business Admin with Marketing Management'],
            ['code' => 'BSBA-MA', 'name' => 'BSBA - Management Accounting', 'department' => 'College Degree', 'description' => 'Business Admin with Management Accounting'],
            ['code' => 'BSBA-HRM', 'name' => 'BSBA - Human Resource Management', 'department' => 'College Degree', 'description' => 'Business Admin with HRM'],

            // College Degree - Education
            ['code' => 'BEEd', 'name' => 'Bachelor of Elementary Education', 'department' => 'College Degree', 'description' => 'Elementary Education degree'],
            ['code' => 'BSEd', 'name' => 'Bachelor of Secondary Education', 'department' => 'College Degree', 'description' => 'Secondary Education degree'],
            ['code' => 'BSEd-Math', 'name' => 'BSEd - Major in Math', 'department' => 'College Degree', 'description' => 'Secondary Ed with Mathematics'],
            ['code' => 'BSEd-English', 'name' => 'BSEd - Major in English', 'department' => 'College Degree', 'description' => 'Secondary Ed with English'],
            ['code' => 'BSEd-Filipino', 'name' => 'BSEd - Major in Filipino', 'department' => 'College Degree', 'description' => 'Secondary Ed with Filipino'],
            ['code' => 'BSEd-Science', 'name' => 'BSEd - Major in Science', 'department' => 'College Degree', 'description' => 'Secondary Ed with Science'],

            // College Degree - Health Sciences
            ['code' => 'BSN', 'name' => 'Bachelor of Science in Nursing', 'department' => 'College Degree', 'description' => 'Nursing degree'],
            ['code' => 'BSCrim', 'name' => 'Bachelor of Science in Criminology', 'department' => 'College Degree', 'description' => 'Criminology degree'],

            // College Degree - Liberal Arts
            ['code' => 'AB-PolSci', 'name' => 'Bachelor of Arts in Political Science', 'department' => 'College Degree', 'description' => 'Political Science degree'],
            ['code' => 'AB-English', 'name' => 'Bachelor of Arts in English Language Studies', 'department' => 'College Degree', 'description' => 'English Language Studies degree'],
            ['code' => 'ABCom', 'name' => 'Bachelor of Arts in Communication', 'department' => 'College Degree', 'description' => 'Communication degree'],

            // College Degree - Information Technology & Hospitality
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'department' => 'College Degree', 'description' => 'Information Technology degree'],
            ['code' => 'BSHM', 'name' => 'Bachelor of Science in Hospitality Management', 'department' => 'College Degree', 'description' => 'Hospitality Management degree'],

            // Graduate Program
            ['code' => 'PhD', 'name' => 'Doctor of Philosophy', 'department' => 'Graduate Program', 'description' => 'PhD degree'],
            ['code' => 'EdD', 'name' => 'Doctor of Education', 'department' => 'Graduate Program', 'description' => 'Doctor of Education degree'],
            ['code' => 'MA.Ed', 'name' => 'Master of Arts in Education', 'department' => 'Graduate Program', 'description' => 'Master of Arts in Education'],
            ['code' => 'MA.Ed-LL', 'name' => 'Master of Arts in Education Major in Language and Literature', 'department' => 'Graduate Program', 'description' => 'MA Education with Language and Literature'],
            ['code' => 'MPA', 'name' => 'Master in Public Administration', 'department' => 'Graduate Program', 'description' => 'Master of Public Administration'],
            ['code' => 'MBA', 'name' => 'Master in Business Administration', 'department' => 'Graduate Program', 'description' => 'Master of Business Administration'],
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(
                ['code' => $course['code']],
                $course
            );
        }
    }
}