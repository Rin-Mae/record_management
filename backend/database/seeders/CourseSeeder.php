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
            // Basic Education
            ['code' => 'ELEM', 'name' => 'Elementary School', 'department' => 'Basic Education Center', 'description' => 'Elementary school level'],
            ['code' => 'JHS', 'name' => 'Junior Highschool', 'department' => 'Basic Education Center', 'description' => 'Junior high school level'],
            
            // Senior Highschool - Tracks
            ['code' => 'SHS-ABM', 'name' => 'Accountancy and Business Management (ABM)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool ABM Track'],
            ['code' => 'SHS-STEM', 'name' => 'Science Technology Engineering and Mathematics (STEM)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool STEM Track'],
            ['code' => 'SHS-HUMSS', 'name' => 'Humanities and Social Sciences (HUMSS)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool HUMSS Track'],
            ['code' => 'SHS-HE', 'name' => 'Home Economics (HE)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool HE Track'],
            ['code' => 'SHS-ICT', 'name' => 'Information Communication Technology (ICT)', 'department' => 'Basic Education Center', 'description' => 'Senior Highschool ICT Track'],

            // College - Science & Technology
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'department' => 'College', 'description' => 'IT degree program'],
            ['code' => 'BSCS', 'name' => 'Bachelor of Science in Computer Science', 'department' => 'College', 'description' => 'Computer Science degree'],
            ['code' => 'BSE', 'name' => 'Bachelor of Science in Engineering', 'department' => 'College', 'description' => 'Engineering degree'],

            // College - Business
            ['code' => 'BSBA', 'name' => 'Bachelor of Science in Business Administration', 'department' => 'College', 'description' => 'Business Administration degree'],
            ['code' => 'BSBA-FM', 'name' => 'BSBA - Financial Management', 'department' => 'College', 'description' => 'Business Admin with Financial Management'],
            ['code' => 'BSBA-MM', 'name' => 'BSBA - Marketing Management', 'department' => 'College', 'description' => 'Business Admin with Marketing Management'],
            ['code' => 'BSBA-HRM', 'name' => 'BSBA - Human Resource Management', 'department' => 'College', 'description' => 'Business Admin with HRM'],
            ['code' => 'BSMA', 'name' => 'Bachelor of Science in Management Accounting', 'department' => 'College', 'description' => 'Management Accounting degree'],
            ['code' => 'BSA', 'name' => 'Bachelor of Science in Accountancy', 'department' => 'College', 'description' => 'Accountancy degree'],

            // College - Liberal Arts
            ['code' => 'AB-PolSci', 'name' => 'AB Political Science', 'department' => 'College', 'description' => 'Political Science degree'],
            ['code' => 'AB-English', 'name' => 'AB English', 'department' => 'College', 'description' => 'English degree'],
            ['code' => 'ABCom', 'name' => 'AB Communication', 'department' => 'College', 'description' => 'Communication degree'],

            // College - Education & Health
            ['code' => 'BEEd', 'name' => 'Bachelor of Elementary Education', 'department' => 'College', 'description' => 'Elementary Education degree'],
            ['code' => 'BSEd', 'name' => 'Bachelor of Secondary Education', 'department' => 'College', 'description' => 'Secondary Education degree'],
            ['code' => 'BSEd-Math', 'name' => 'BSEd - Mathematics', 'department' => 'College', 'description' => 'Secondary Ed with Mathematics'],
            ['code' => 'BSEd-English', 'name' => 'BSEd - English', 'department' => 'College', 'description' => 'Secondary Ed with English'],
            ['code' => 'BSEd-Filipino', 'name' => 'BSEd - Filipino', 'department' => 'College', 'description' => 'Secondary Ed with Filipino'],
            ['code' => 'BSEd-Science', 'name' => 'BSEd - Science', 'department' => 'College', 'description' => 'Secondary Ed with Science'],
            ['code' => 'BSN', 'name' => 'Bachelor of Science in Nursing', 'department' => 'College', 'description' => 'Nursing degree'],
            ['code' => 'BSCrim', 'name' => 'Bachelor of Science in Criminology', 'department' => 'College', 'description' => 'Criminology degree'],

            // College - Hospitality & Tourism
            ['code' => 'BSHM', 'name' => 'Bachelor of Science in Hospitality Management', 'department' => 'College', 'description' => 'Hospitality Management degree'],

            // College - Geoscience
            ['code' => 'BSGE', 'name' => 'Bachelor of Science in Geodetic Engineering', 'department' => 'College', 'description' => 'Geodetic Engineering degree'],

            // Graduate Programs
            ['code' => 'Ph.D', 'name' => 'Doctor of Philosophy', 'department' => 'Graduate', 'description' => 'PhD degree'],
            ['code' => 'Ed.D', 'name' => 'Doctor of Education', 'department' => 'Graduate', 'description' => 'Doctor of Education'],
            ['code' => 'MA.Ed', 'name' => 'Master of Arts in Education', 'department' => 'Graduate', 'description' => 'Master of Arts in Education'],
            ['code' => 'MA.Ed-LL', 'name' => 'MA.Ed - Leadership & Learning', 'department' => 'Graduate', 'description' => 'MA Education with Leadership & Learning'],
            ['code' => 'MPA', 'name' => 'Master of Public Administration', 'department' => 'Graduate', 'description' => 'Master of Public Administration'],
            ['code' => 'MBA', 'name' => 'Master of Business Administration', 'department' => 'Graduate', 'description' => 'Master of Business Administration'],
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(
                ['code' => $course['code']],
                $course
            );
        }
    }
}