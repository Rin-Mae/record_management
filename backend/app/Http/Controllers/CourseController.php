<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    /**
     * Display all courses.
     */
    public function index(Request $request)
    {
        $query = Course::select('id', 'code', 'name', 'department', 'description', 'created_at');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by department
        if ($request->has('department') && $request->department) {
            $query->where('department', $request->department);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
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
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => ['required', 'string', 'max:50', 'unique:courses'],
            'name' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $course = Course::create($validator->validated());
        
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
    public function update(Request $request, Course $course)
    {
        $validator = Validator::make($request->all(), [
            'code' => ['required', 'string', 'max:50', 'unique:courses,code,' . $course->id],
            'name' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $course->update($validator->validated());
        
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
