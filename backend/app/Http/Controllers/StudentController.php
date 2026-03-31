<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\RecordType;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     * Only shows verified students.
     */
    public function index(Request $request)
    {
        $query = User::verifiedStudents()
            ->select('id', 'student_id', 'firstname', 'middlename', 'lastname', 'email', 'birthdate', 'age', 'gender', 'address', 'contact_number', 'course_id', 'created_at');

        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Apply course filter
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort_by to prevent SQL injection
        $allowedSortColumns = ['id', 'student_id', 'firstname', 'lastname', 'email', 'course_id', 'created_at'];
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
     * Note: Students are created in a pending state and must be verified by an admin.
     */
    public function store(StoreStudentRequest $request)
    {
        $validated = $request->validated();
        $validated['role'] = 'student';
        $validated['is_admin_verified'] = false; // Students are unverified by default

        $student = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully. Awaiting admin verification.',
            'data' => $student,
        ], 201);
    }

    /**
     * Display the specified student.
     * Only verified students can be displayed.
     */
    public function show(User $student)
    {
        if ($student->role !== 'student' || !$student->is_admin_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found or not verified',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    /**
     * Update the specified student.
     * Only verified students can be updated.
     */
    public function update(UpdateStudentRequest $request, User $student)
    {
        if ($student->role !== 'student' || !$student->is_admin_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found or not verified',
            ], 404);
        }

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
     * Only verified students can be deleted (or allow deletion of unverified pending students).
     */
    public function destroy(User $student)
    {
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a student',
            ], 404);
        }

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
                ['id' => null, 'code' => 'ELEM', 'label' => 'Elementary'],
                ['id' => null, 'code' => 'JHS', 'label' => 'Junior High'],
                ['id' => null, 'code' => 'SHS-ABM', 'label' => 'SHS-ABM'],
                ['id' => null, 'code' => 'SHS-STEM', 'label' => 'SHS-STEM'],
                ['id' => null, 'code' => 'SHS-HUMSS', 'label' => 'SHS-HUMSS'],
                ['id' => null, 'code' => 'SHS-HE', 'label' => 'SHS-HE'],
                ['id' => null, 'code' => 'SHS-ICT', 'label' => 'SHS-ICT'],
            ],
            'college' => [
                ['id' => null, 'code' => 'BSGE', 'label' => 'BSGE'],
                ['id' => null, 'code' => 'BSA', 'label' => 'BSA'],
                ['id' => null, 'code' => 'BEEd', 'label' => 'BEEd'],
                ['id' => null, 'code' => 'BSEd', 'label' => 'BSEd'],
                ['id' => null, 'code' => 'BSEd-Math', 'label' => 'BSEd-Math'],
                ['id' => null, 'code' => 'BSEd-English', 'label' => 'BSEd-Eng'],
                ['id' => null, 'code' => 'BSEd-Filipino', 'label' => 'BSEd-Fil'],
                ['id' => null, 'code' => 'BSEd-Science', 'label' => 'BSEd-Sci'],
                ['id' => null, 'code' => 'BSCrim', 'label' => 'BSCrim'],
                ['id' => null, 'code' => 'BSN', 'label' => 'BSN'],
                ['id' => null, 'code' => 'AB-PolSci', 'label' => 'AB-PolSci'],
                ['id' => null, 'code' => 'AB-English', 'label' => 'AB-Eng'],
                ['id' => null, 'code' => 'ABCom', 'label' => 'ABCom'],
                ['id' => null, 'code' => 'BSBA', 'label' => 'BSBA'],
                ['id' => null, 'code' => 'BSBA-FM', 'label' => 'BSBA-FM'],
                ['id' => null, 'code' => 'BSBA-MM', 'label' => 'BSBA-MM'],
                ['id' => null, 'code' => 'BSBA-HRM', 'label' => 'BSBA-HRM'],
                ['id' => null, 'code' => 'BSMA', 'label' => 'BSMA'],
                ['id' => null, 'code' => 'BSIT', 'label' => 'BSIT'],
                ['id' => null, 'code' => 'BSHM', 'label' => 'BSHM'],
            ],
            'graduate' => [
                ['id' => null, 'code' => 'PhD', 'label' => 'Ph.D'],
                ['id' => null, 'code' => 'EdD', 'label' => 'Ed.D'],
                ['id' => null, 'code' => 'MA.Ed', 'label' => 'MA.Ed'],
                ['id' => null, 'code' => 'MA.Ed-LL', 'label' => 'MA.Ed-LL'],
                ['id' => null, 'code' => 'MPA', 'label' => 'MPA'],
                ['id' => null, 'code' => 'MBA', 'label' => 'MBA'],
            ],
        ];

        // Get course IDs mapped by code
        $courseCodes = array_merge(
            array_column($courseGroups['bec'], 'code'),
            array_column($courseGroups['college'], 'code'),
            array_column($courseGroups['graduate'], 'code')
        );
        
        $courseIds = \App\Models\Course::whereIn('code', $courseCodes)
            ->pluck('id', 'code')
            ->toArray();
        
        // Get all course counts (only verified students)
        $courseCounts = User::where('role', 'student')
            ->where('is_admin_verified', true)
            ->whereIn('course_id', array_values($courseIds))
            ->groupBy('course_id')
            ->selectRaw('course_id, COUNT(*) as count')
            ->get()
            ->keyBy('course_id')
            ->pluck('count')
            ->toArray();
        
        // Process each group
        $processCourseGroup = function($group) use ($courseCounts, $courseIds) {
            return array_map(
                function($course) use ($courseCounts, $courseIds) {
                    $courseId = $courseIds[$course['code']] ?? null;
                    return ['name' => $course['label'], 'count' => $courseCounts[$courseId] ?? 0];
                },
                $group
            );
        };
        
        $becData = $processCourseGroup($courseGroups['bec']);
        $collegeData = $processCourseGroup($courseGroups['college']);
        $graduateData = $processCourseGroup($courseGroups['graduate']);

        return response()->json([
            'success' => true,
            'data' => [
                'total' => User::where('role', 'student')
                    ->where('is_admin_verified', true)
                    ->count(),
                'bec' => array_sum(array_column($becData, 'count')),
                'college' => array_sum(array_column($collegeData, 'count')),
                'graduate' => array_sum(array_column($graduateData, 'count')),
                'becCourses' => $becData,
                'collegeCourses' => $collegeData,
                'graduateCourses' => $graduateData,
            ],
        ]);
    }

    /**
     * Get all verified students with their records by type.
     * Includes students with no records yet.
     */
    public function verifiedStudentsWithRecords(Request $request, $type)
    {
        // Generate slug from type param (in case it's passed as a slug)
        $slug = strtolower(str_replace(' ', '-', $type));
        
        // Lookup record type by name from database (case-insensitive)
        $recordType = \App\Models\RecordType::whereRaw('LOWER(name) = ?', [strtolower(str_replace('-', ' ', $slug))])
            ->first();
            
        if (!$recordType) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        // Use the actual name from database
        $actualTypeName = $recordType->name;

        // Get all verified students
        $students = User::verifiedStudents()
            ->select('id', 'student_id', 'firstname', 'lastname', 'email', 'course_id')
            ->orderBy('firstname', 'asc')
            ->orderBy('lastname', 'asc')
            ->get();

        // For each student, get their records of the specified type
        $result = $students->map(function ($student) use ($actualTypeName) {
            $record = \App\Models\StudentRecord::where('user_id', $student->id)
                ->where('record_type', $actualTypeName)
                ->where('verification_status', 'verified') // Only return verified records
                ->with('files')
                ->first();

            // Return record data or null
            if (!$record) {
                return null; // Will be filtered out below
            }

            // Return consistent structure
            return [
                'id' => $record->id,
                'user_id' => $record->user_id,
                'record_type' => $record->record_type,
                'title' => $record->title,
                'description' => $record->description ?? null,
                'created_at' => $record->created_at,
                'updated_at' => $record->updated_at,
                'student' => $student,
                'files' => $record->files ?? [],
            ];
        })->filter()->values(); // Remove nulls and reset keys

        return response()->json([
            'success' => true,
            'data' => $result,
            'type' => $slug,
            'type_label' => $actualTypeName,
        ]);
    }
}
