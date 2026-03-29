<?php

namespace App\Http\Controllers;

use App\Models\StudentRecord;
use App\Http\Requests\StoreStudentRecordRequest;
use App\Http\Requests\UpdateStudentRecordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class StudentRecordController extends Controller
{
    /**
     * Get all records by type across all students.
     */
    public function byType(Request $request, $type)
    {
        // Validate type
        if (!array_key_exists($type, StudentRecord::RECORD_TYPES)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        $query = StudentRecord::with(['student:id,student_id,firstname,lastname,course', 'files:id,student_record_id,file_path,file_name'])
            ->where('record_type', $type);

        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Apply course filter
        if ($request->has('course') && $request->course) {
            $query->byCourse($request->course);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort_by to prevent SQL injection
        $allowedSortColumns = ['id', 'title', 'student_id', 'created_at'];
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
        $records = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $records,
            'type' => $type,
            'type_label' => StudentRecord::RECORD_TYPES[$type],
        ]);
    }

    /**
     * Store a record by type.
     */
    public function storeByType(StoreStudentRecordRequest $request, $type)
    {
        // Validate type
        if (!array_key_exists($type, StudentRecord::RECORD_TYPES)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        $validated = $request->validated();

        // Auto-generate title from type label
        $data = [
            'student_id' => $validated['student_id'],
            'record_type' => $type,
            'title' => StudentRecord::RECORD_TYPES[$type],
        ];

        $record = StudentRecord::create($data);

        // Store multiple files
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("student_records/{$validated['student_id']}", 'public');
                $record->files()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $record->load(['student', 'files']);

        return response()->json([
            'success' => true,
            'message' => 'Record created successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * Update a record by type.
     */
    public function updateByType(UpdateStudentRecordRequest $request, $type, StudentRecord $record)
    {
        if ($record->record_type !== $type) {
            return response()->json([
                'success' => false,
                'message' => 'Record does not belong to this type',
            ], 404);
        }

        $validated = $request->validated();

        // Update student if provided
        if ($request->has('student_id')) {
            $record->student_id = $validated['student_id'];
            $record->save();
        }

        // Remove files if requested
        if ($request->has('remove_file_ids')) {
            $filesToRemove = $record->files()->whereIn('id', $validated['remove_file_ids'])->get();
            foreach ($filesToRemove as $fileRecord) {
                Storage::disk('public')->delete($fileRecord->file_path);
                $fileRecord->delete();
            }
        }

        // Add new files
        if ($request->hasFile('files')) {
            $currentCount = $record->files()->count();
            $newCount = count($request->file('files'));

            if ($currentCount + $newCount > 5) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maximum 5 files allowed per record',
                    'errors' => ['files' => ['Maximum 5 files allowed per record. Currently has ' . $currentCount . ' file(s).']],
                ], 422);
            }

            $studentId = $record->student_id;
            foreach ($request->file('files') as $file) {
                $path = $file->store("student_records/{$studentId}", 'public');
                $record->files()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // Ensure at least 1 file remains
        $record->load('files');
        if ($record->files->count() < 1) {
            return response()->json([
                'success' => false,
                'message' => 'At least 1 file is required',
                'errors' => ['files' => ['At least 1 file is required.']],
            ], 422);
        }

        $record->load('student');

        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully',
            'data' => $record,
        ]);
    }

    /**
     * Delete a record by type.
     */
    public function destroyByType($type, StudentRecord $record)
    {
        if ($record->record_type !== $type) {
            return response()->json([
                'success' => false,
                'message' => 'Record does not belong to this type',
            ], 404);
        }

        // Delete single file if exists
        if ($record->file_path) {
            Storage::disk('public')->delete($record->file_path);
        }

        // Delete multi-file records
        foreach ($record->files as $fileRecord) {
            Storage::disk('public')->delete($fileRecord->file_path);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully',
        ]);
    }

    /**
     * Get valid record types.
     */
    public function types()
    {
        $types = Cache::rememberForever('record_types', function () {
            return StudentRecord::RECORD_TYPES;
        });

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}
