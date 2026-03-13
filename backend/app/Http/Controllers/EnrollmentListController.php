<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentList;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnrollmentListController extends Controller
{
    /**
     * List all enrollment periods (paginated).
     */
    public function index(Request $request)
    {
        $query = EnrollmentList::withCount('students');

        // Search by academic year
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('academic_year', 'like', "%{$search}%")
                  ->orWhere('period', 'like', "%{$search}%");
            });
        }

        $query->orderBy('academic_year', 'desc')->orderBy('period', 'asc');

        $perPage = $request->get('per_page', 10);
        $lists = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $lists,
        ]);
    }

    /**
     * Create a new enrollment period.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|in:1st Semester,2nd Semester',
            'academic_year' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check for duplicate
        $exists = EnrollmentList::where('period', $request->period)
            ->where('academic_year', $request->academic_year)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This enrollment period already exists.',
                'errors' => ['academic_year' => ['This period and academic year combination already exists.']],
            ], 422);
        }

        $list = EnrollmentList::create([
            'period' => $request->period,
            'academic_year' => $request->academic_year,
        ]);

        $list->loadCount('students');

        return response()->json([
            'success' => true,
            'message' => 'Enrollment period created successfully',
            'data' => $list,
        ], 201);
    }

    /**
     * Update an enrollment period.
     */
    public function update(Request $request, EnrollmentList $enrollmentList)
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|in:1st Semester,2nd Semester',
            'academic_year' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check for duplicate (excluding self)
        $exists = EnrollmentList::where('period', $request->period)
            ->where('academic_year', $request->academic_year)
            ->where('id', '!=', $enrollmentList->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This enrollment period already exists.',
                'errors' => ['academic_year' => ['This period and academic year combination already exists.']],
            ], 422);
        }

        $enrollmentList->update([
            'period' => $request->period,
            'academic_year' => $request->academic_year,
        ]);

        $enrollmentList->loadCount('students');

        return response()->json([
            'success' => true,
            'message' => 'Enrollment period updated successfully',
            'data' => $enrollmentList,
        ]);
    }

    /**
     * Delete an enrollment period and its student associations.
     */
    public function destroy(EnrollmentList $enrollmentList)
    {
        $enrollmentList->delete();

        return response()->json([
            'success' => true,
            'message' => 'Enrollment period deleted successfully',
        ]);
    }

    /**
     * Get the students for a specific enrollment period (paginated).
     */
    public function students(Request $request, EnrollmentList $enrollmentList)
    {
        $query = $enrollmentList->students();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                  ->orWhere('lastname', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhere('course', 'like', "%{$search}%");
            });
        }

        $query->orderBy('lastname')->orderBy('firstname');

        $perPage = $request->get('per_page', 20);
        $students = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $students,
            'enrollment' => [
                'id' => $enrollmentList->id,
                'period' => $enrollmentList->period,
                'academic_year' => $enrollmentList->academic_year,
            ],
        ]);
    }

    /**
     * Add students to an enrollment period.
     */
    public function addStudents(Request $request, EnrollmentList $enrollmentList)
    {
        $validator = Validator::make($request->all(), [
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // syncWithoutDetaching avoids duplicates
        $enrollmentList->students()->syncWithoutDetaching($request->student_ids);

        $enrollmentList->loadCount('students');

        return response()->json([
            'success' => true,
            'message' => count($request->student_ids) . ' student(s) added successfully',
            'data' => $enrollmentList,
        ]);
    }

    /**
     * Remove a student from an enrollment period.
     */
    public function removeStudent(EnrollmentList $enrollmentList, Student $student)
    {
        $enrollmentList->students()->detach($student->id);
        $enrollmentList->loadCount('students');

        return response()->json([
            'success' => true,
            'message' => 'Student removed from enrollment list',
            'data' => $enrollmentList,
        ]);
    }
}
