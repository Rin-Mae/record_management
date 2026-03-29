<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CourseController extends Controller
{
    /**
     * Display all courses.
     */
    public function index(Request $request)
    {
        $query = Course::select('id', 'code', 'name', 'department', 'description', 'created_at');

        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Apply department filter
        if ($request->has('department') && $request->department) {
            $query->byDepartment($request->department);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort_by to prevent SQL injection
        $allowedSortColumns = ['id', 'code', 'name', 'department', 'created_at'];
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
        $courses = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    /**
     * Get all courses (no pagination - for dropdowns).
     */
    public function all()
    {
        $courses = Cache::remember('courses_all', 3600, function () {
            return Course::select('id', 'code', 'name')->orderBy('code')->get();
        });

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    /**
     * Store a newly created course.
     */
    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();

        $course = Course::create($validated);
        
        // Invalidate courses cache
        Cache::forget('courses_all');

        return response()->json([
            'success' => true,
            'data' => $course,
            'message' => 'Course created successfully',
        ], 201);
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course)
    {
        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    /**
     * Update the specified course.
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $validated = $request->validated();

        $course->update($validated);
        
        // Invalidate courses cache
        Cache::forget('courses_all');

        return response()->json([
            'success' => true,
            'data' => $course,
            'message' => 'Course updated successfully',
        ]);
    }

    /**
     * Remove the specified course.
     */
    public function destroy(Course $course)
    {
        $course->delete();
        
        // Invalidate courses cache
        Cache::forget('courses_all');

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully',
        ]);
    }

    /**
     * Get course statistics.
     */
    public function statistics()
    {
        $totalCourses = Course::count();
        $departmentCount = Course::distinct('department')->count('department');

        // Count students per course in a single query
        $courseStudentStats = Course::withCount('students')
            ->orderBy('students_count', 'desc')
            ->limit(5)
            ->select('code', 'name')
            ->get()
            ->map(function ($course) {
                return [
                    'code' => $course->code,
                    'name' => $course->name,
                    'student_count' => $course->students_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'total_courses' => $totalCourses,
                'total_departments' => $departmentCount,
                'top_courses' => $courseStudentStats,
            ],
        ]);
    }
}
