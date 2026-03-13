<?php

namespace App\Http\Controllers;

use App\Models\StudentRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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

        $query = StudentRecord::with(['student', 'files'])
            ->where('record_type', $type);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('file_name', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('firstname', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('student_id', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by course
        if ($request->has('course') && $request->course) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('course', $request->course);
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $records = $query->paginate($perPage);

        // Append file URLs
        $records->getCollection()->transform(function ($record) {
            if ($record->file_path) {
                $record->file_url = asset('storage/' . $record->file_path);
            }
            // Append URLs for multi-file records
            $record->files->transform(function ($file) {
                $file->file_url = asset('storage/' . $file->file_path);
                return $file;
            });
            return $record;
        });

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
    public function storeByType(Request $request, $type)
    {
        // Validate type
        if (!array_key_exists($type, StudentRecord::RECORD_TYPES)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        // Build validation rules: student + 1-5 files
        $rules = [
            'student_id' => 'required|exists:students,id',
            'files' => 'required|array|min:1|max:5',
            'files.*' => 'file|max:10240',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Auto-generate title from type label
        $data = [
            'student_id' => $request->student_id,
            'record_type' => $type,
            'title' => StudentRecord::RECORD_TYPES[$type],
        ];

        $record = StudentRecord::create($data);

        // Store multiple files
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("student_records/{$request->student_id}", 'public');
                $record->files()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $record->load(['student', 'files']);
        $record->files->transform(function ($file) {
            $file->file_url = asset('storage/' . $file->file_path);
            return $file;
        });

        return response()->json([
            'success' => true,
            'message' => 'Record created successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * Update a record by type.
     */
    public function updateByType(Request $request, $type, StudentRecord $record)
    {
        if ($record->record_type !== $type) {
            return response()->json([
                'success' => false,
                'message' => 'Record does not belong to this type',
            ], 404);
        }

        $rules = [
            'student_id' => 'sometimes|required|exists:students,id',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240',
            'remove_file_ids' => 'nullable|array',
            'remove_file_ids.*' => 'integer|exists:record_files,id',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update student if provided
        if ($request->has('student_id')) {
            $record->student_id = $request->student_id;
            $record->save();
        }

        // Remove files if requested
        if ($request->has('remove_file_ids')) {
            $filesToRemove = $record->files()->whereIn('id', $request->remove_file_ids)->get();
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
        $record->files->transform(function ($file) {
            $file->file_url = asset('storage/' . $file->file_path);
            return $file;
        });

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
        return response()->json([
            'success' => true,
            'data' => StudentRecord::RECORD_TYPES,
        ]);
    }
}
