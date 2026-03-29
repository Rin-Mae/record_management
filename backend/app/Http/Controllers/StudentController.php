<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        $query = Student::select('id', 'student_id', 'firstname', 'middlename', 'lastname', 'email', 'birthdate', 'age', 'gender', 'address', 'contact_number', 'course', 'year_level', 'created_at');

        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Apply course filter
        if ($request->has('course') && $request->course) {
            $query->byCourse($request->course);
        }

        // Apply year level filter
        if ($request->has('year_level') && $request->year_level) {
            $query->byYearLevel($request->year_level);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort_by to prevent SQL injection
        $allowedSortColumns = ['id', 'student_id', 'firstname', 'lastname', 'email', 'course', 'year_level', 'created_at'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'created_at';
        }
        
        // Validate sort_order
        if (!in_array(strtoupper($sortOrder), ['ASC', 'DESC'])) {
            $sortOrder = 'desc';
        }
        
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = max(1, min($request->get('per_page', 10), 100)); // Limit per_page between 1 and 100
        $students = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(StoreStudentRequest $request)
    {
        $validated = $request->validated();

        $student = Student::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully',
            'data' => $student,
        ], 201);
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student)
    {
        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    /**
     * Update the specified student.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        $validated = $request->validated();

        $student->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student,
        ]);
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully',
        ]);
    }

    /**
     * Get student statistics for dashboard.
     */
    public function statistics(Request $request)
    {
        // Define course groups
        $courseGroups = [
            'bec' => [
                ['code' => 'ELEM', 'label' => 'Elementary'],
                ['code' => 'JHS', 'label' => 'Junior High'],
                ['code' => 'SHS-ABM', 'label' => 'SHS-ABM'],
                ['code' => 'SHS-STEM', 'label' => 'SHS-STEM'],
                ['code' => 'SHS-HUMSS', 'label' => 'SHS-HUMSS'],
                ['code' => 'SHS-HE', 'label' => 'SHS-HE'],
                ['code' => 'SHS-ICT', 'label' => 'SHS-ICT'],
            ],
            'college' => [
                ['code' => 'BSGE', 'label' => 'BSGE'],
                ['code' => 'BSA', 'label' => 'BSA'],
                ['code' => 'BEEd', 'label' => 'BEEd'],
                ['code' => 'BSEd', 'label' => 'BSEd'],
                ['code' => 'BSEd-Math', 'label' => 'BSEd-Math'],
                ['code' => 'BSEd-English', 'label' => 'BSEd-Eng'],
                ['code' => 'BSEd-Filipino', 'label' => 'BSEd-Fil'],
                ['code' => 'BSEd-Science', 'label' => 'BSEd-Sci'],
                ['code' => 'BSCrim', 'label' => 'BSCrim'],
                ['code' => 'BSN', 'label' => 'BSN'],
                ['code' => 'AB-PolSci', 'label' => 'AB-PolSci'],
                ['code' => 'AB-English', 'label' => 'AB-Eng'],
                ['code' => 'ABCom', 'label' => 'ABCom'],
                ['code' => 'BSBA', 'label' => 'BSBA'],
                ['code' => 'BSBA-FM', 'label' => 'BSBA-FM'],
                ['code' => 'BSBA-MM', 'label' => 'BSBA-MM'],
                ['code' => 'BSBA-HRM', 'label' => 'BSBA-HRM'],
                ['code' => 'BSMA', 'label' => 'BSMA'],
                ['code' => 'BSIT', 'label' => 'BSIT'],
                ['code' => 'BSHM', 'label' => 'BSHM'],
            ],
            'graduate' => [
                ['code' => 'Ph.D', 'label' => 'Ph.D'],
                ['code' => 'Ed.D', 'label' => 'Ed.D'],
                ['code' => 'MA.Ed', 'label' => 'MA.Ed'],
                ['code' => 'MA.Ed-LL', 'label' => 'MA.Ed-LL'],
                ['code' => 'MPA', 'label' => 'MPA'],
                ['code' => 'MBA', 'label' => 'MBA'],
            ],
        ];
        
        // Get all course codes
        $allCourseCodes = array_merge(
            array_column($courseGroups['bec'], 'code'),
            array_column($courseGroups['college'], 'code'),
            array_column($courseGroups['graduate'], 'code')
        );
        
        // Single query to get all course counts
        $courseCounts = Student::select('course')
            ->whereIn('course', $allCourseCodes)
            ->groupBy('course')
            ->selectRaw('course, COUNT(*) as count')
            ->get()
            ->keyBy('course')
            ->pluck('count')
            ->toArray();
        
        // Process each group
        $processCourseGroup = function($group) use ($courseCounts) {
            return array_map(
                fn($course) => ['name' => $course['label'], 'count' => $courseCounts[$course['code']] ?? 0],
                $group
            );
        };
        
        $becData = $processCourseGroup($courseGroups['bec']);
        $collegeData = $processCourseGroup($courseGroups['college']);
        $graduateData = $processCourseGroup($courseGroups['graduate']);

        return response()->json([
            'success' => true,
            'data' => [
                'total' => Student::count(),
                'bec' => array_sum(array_column($becData, 'count')),
                'college' => array_sum(array_column($collegeData, 'count')),
                'graduate' => array_sum(array_column($graduateData, 'count')),
                'becCourses' => $becData,
                'collegeCourses' => $collegeData,
                'graduateCourses' => $graduateData,
            ],
        ]);
    }
}
