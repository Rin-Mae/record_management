<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\RecordType;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     * Only shows verified students.
     */
    public function index(Request $request)
    {
        $query = User::verifiedStudents()
            ->leftJoin('courses', 'users.course_id', '=', 'courses.id')
            ->select('users.id', 'users.student_id', 'users.firstname', 'users.middlename', 'users.lastname', 'users.email', 'users.birthdate', 'users.age', 'users.gender', 'users.address', 'users.contact_number', 'users.course_id', 'courses.code as course', 'users.created_at');

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
     * Note: Students created by admin are auto-verified and don't need email verification.
     */
    public function store(StoreStudentRequest $request)
    {
        $validated = $request->validated();
        $validated['role'] = 'student';
        $validated['password'] = Hash::make('password'); // Default hashed password
        // Generate default email if not provided
        if (empty($validated['email'])) {
            $validated['email'] = $validated['student_id'] . '@email.com';
        }
        // Convert course code to course_id
        if (!empty($validated['course'])) {
            $course = Course::where('code', $validated['course'])->first();
            $validated['course_id'] = $course ? $course->id : null;
        }
        unset($validated['course']); // Remove course code field
        $validated['is_admin_verified'] = true; // Admin-added students are auto-verified
        $validated['email_verified_at'] = now(); // Mark email as verified

        $student = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully.',
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

        // Convert course code to course_id if provided
        if (isset($validated['course'])) {
            if (!empty($validated['course'])) {
                $course = Course::where('code', $validated['course'])->first();
                $validated['course_id'] = $course ? $course->id : null;
            } else {
                $validated['course_id'] = null;
            }
            unset($validated['course']); // Remove course code field
        }

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
     * Dynamically fetches courses from the database instead of hardcoded values.
     */
    public function statistics(Request $request)
    {
        // Get all courses from database, grouped by department
        $allCourses = \App\Models\Course::all(['id', 'code', 'name', 'department']);
        
        // Group courses by department
        $coursesByDept = $allCourses->groupBy('department')->toArray();
        
        // Transform to the format needed for statistics
        $courseGroups = [];
        foreach ($coursesByDept as $dept => $courses) {
            // Map course data
            $courseList = array_map(function($course) {
                return [
                    'code' => $course['code'],
                    'label' => $course['code'], // Use code as label (or name if preferred)
                    'name' => $course['name'],
                ];
            }, $courses);
            
            // Use department as key (sanitized)
            $deptKey = strtolower(str_replace(' ', '_', $dept));
            $courseGroups[$deptKey] = $courseList;
        }
        
        // Get all course codes needed for the query
        $allCourseCodes = $allCourses->pluck('code')->toArray();
        
        // Get course IDs mapped by code
        $courseIds = \App\Models\Course::whereIn('code', $allCourseCodes)
            ->pluck('id', 'code')
            ->toArray();
        
        // Get all course counts (only verified students)
        $courseCounts = User::where('role', 'student')
            ->where('is_admin_verified', true)
            ->whereIn('course_id', array_values($courseIds))
            ->groupBy('course_id')
            ->selectRaw('course_id, COUNT(*) as count')
            ->get()
            ->pluck('count', 'course_id')
            ->toArray();
        
        // Process each group
        $processCourseGroup = function($group) use ($courseCounts, $courseIds) {
            return array_map(
                function($course) use ($courseCounts, $courseIds) {
                    $courseId = $courseIds[$course['code']] ?? null;
                    return [
                        'code' => $course['code'],
                        'name' => $course['label'],
                        'count' => $courseCounts[$courseId] ?? 0
                    ];
                },
                $group
            );
        };
        
        // Process all departments
        $processedGroups = [];
        $totalByDept = [];
        foreach ($courseGroups as $deptKey => $group) {
            $processedGroups[$deptKey] = $processCourseGroup($group);
            $totalByDept[$deptKey] = array_sum(array_column($processedGroups[$deptKey], 'count'));
        }
        
        // Get total verified student count
        $totalStudents = User::where('role', 'student')
            ->where('is_admin_verified', true)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalStudents,
                'departments' => $processedGroups,
                'departmentTotals' => $totalByDept,
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

    /**
     * Get all students with their submitted records across all types.
     * Optimized for the records checklist view.
     */
    public function recordsChecklist()
    {
        try {
            // Get all verified students with their courses
            $students = User::verifiedStudents()
                ->with('course:id,name')
                ->select('id', 'student_id', 'firstname', 'middlename', 'lastname', 'email', 'course_id')
                ->orderBy('firstname', 'asc')
                ->orderBy('lastname', 'asc')
                ->get();

            // Get all record types
            $recordTypes = RecordType::select('id', 'name')->orderBy('name')->get();

            // Get all verified student records grouped by user and type
            $allRecords = \App\Models\StudentRecord::where('verification_status', 'verified')
                ->select('id', 'user_id', 'record_type', 'created_at')
                ->get();

            // Build checklist data
            $studentChecklists = $students->map(function ($student) use ($recordTypes, $allRecords) {
                $recordsMap = [];
                
                foreach ($recordTypes as $type) {
                    // Filter records for this student and type
                    $typeRecords = $allRecords->filter(function ($record) use ($student, $type) {
                        return $record->user_id === $student->id && $record->record_type === $type->name;
                    });
                    
                    $recordsMap[$type->name] = [
                        'count' => $typeRecords->count(),
                        'submitted' => $typeRecords->count() > 0,
                    ];
                }

                return [
                    'id' => $student->id,
                    'student_id' => $student->student_id,
                    'name' => trim($student->firstname . ' ' . ($student->middlename ? $student->middlename . ' ' : '') . $student->lastname),
                    'email' => $student->email,
                    'course' => $student->course ? $student->course->name : null,
                    'records' => $recordsMap,
                ];
            });

            // Get record types for frontend
            $types = $recordTypes->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'students' => $studentChecklists,
                    'record_types' => $types,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Records checklist error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load records checklist: ' . $e->getMessage(),
            ], 500);
        }
    }
}
