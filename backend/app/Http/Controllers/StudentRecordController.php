<?php

namespace App\Http\Controllers;

use App\Models\StudentRecord;
use App\Models\RecordType;
use App\Http\Requests\StoreStudentRecordRequest;
use App\Http\Requests\UpdateStudentRecordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class StudentRecordController extends Controller
{
    /**
     * Get all records by type across all students.
     * Only shows records from verified students.
     */
    public function byType(Request $request, $type)
    {
        // Generate slug from type param (in case it's passed as a slug)
        $slug = strtolower(str_replace(' ', '-', $type));
        
        // Lookup record type by name from database (case-insensitive)
        $recordType = RecordType::whereRaw('LOWER(name) = ?', [strtolower(str_replace('-', ' ', $slug))])
            ->first();
            
        if (!$recordType) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        // Use the actual name from database for the query
        $actualTypeName = $recordType->name;

        $query = StudentRecord::with(['student:id,firstname,lastname,course_id', 'files:id,student_record_id,file_path,file_name,file_type,file_size'])
            ->whereHas('student', function ($q) {
                // Only include records from verified students
                $q->where('is_admin_verified', true);
            })
            ->where('record_type', $actualTypeName);

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
        $allowedSortColumns = ['id', 'title', 'created_at'];
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
            'type' => $slug,
            'type_label' => $recordType->name,
        ]);
    }

    /**
     * Store a record by type.
     */
    public function storeByType(StoreStudentRecordRequest $request, $type)
    {
        // Generate slug from type param (in case it's passed as a slug)
        $slug = strtolower(str_replace(' ', '-', $type));
        
        // Lookup record type by name from database (case-insensitive)
        $recordType = RecordType::whereRaw('LOWER(name) = ?', [strtolower(str_replace('-', ' ', $slug))])
            ->first();
            
        if (!$recordType) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        $validated = $request->validated();

        // Auto-generate title from type label
        // Admin records are auto-verified - set verification_status to 'verified'
        $data = [
            'user_id' => $validated['student_id'],
            'record_type' => $recordType->name,
            'title' => $recordType->name,
            'verification_status' => 'verified', // Auto-verify admin uploads
            'verified_by' => $request->user()->id, // Set admin as verifier
            'verified_at' => now(), // Set current timestamp
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
        // Generate slug from type param (in case it's passed as a slug)
        $slug = strtolower(str_replace(' ', '-', $type));
        $recordTypeSlug = strtolower(str_replace(' ', '-', $record->record_type));
        
        // Check if the record belongs to this type (compare slugs)
        if ($recordTypeSlug !== $slug && $record->record_type !== $type) {
            return response()->json([
                'success' => false,
                'message' => 'Record does not belong to this type',
            ], 404);
        }

        $validated = $request->validated();

        // Update student if provided
        if ($request->has('student_id')) {
            $record->user_id = $validated['student_id'];
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

            $studentId = $record->user_id;
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
        // Generate slug from type param (in case it's passed as a slug)
        $slug = strtolower(str_replace(' ', '-', $type));
        $recordTypeSlug = strtolower(str_replace(' ', '-', $record->record_type));
        
        // Check if the record belongs to this type (compare slugs)
        if ($recordTypeSlug !== $slug && $record->record_type !== $type) {
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
            return RecordType::get(['id', 'name'])->mapWithKeys(function ($type) {
                // Generate slug from name for the code
                $code = strtolower(str_replace(' ', '-', $type->name));
                return [$code => $type->name];
            })->toArray();
        });

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    /**
     * Student uploads a record of a specific type.
     * The authenticated user's ID is used automatically.
     */
    public function studentStoreByType(Request $request, $type)
    {
        // Generate slug from type param (in case it's passed as a slug)
        $slug = strtolower(str_replace(' ', '-', $type));
        
        // Lookup record type by name from database (case-insensitive)
        $recordType = RecordType::whereRaw('LOWER(name) = ?', [strtolower(str_replace('-', ' ', $slug))])
            ->first();
            
        if (!$recordType) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid record type',
            ], 422);
        }

        // Debug: log request data
        $filesForLogging = $request->file('files');
        if ($filesForLogging && !is_array($filesForLogging)) {
            $filesForLogging = [$filesForLogging];
        }
        Log::info('studentStoreByType request:', [
            'has_files' => $request->hasFile('files'),
            'files_count' => count($filesForLogging ?? []),
            'all_keys' => array_keys($request->all()),
        ]);

        // Check if files are present
        if (!$request->hasFile('files')) {
            return response()->json([
                'success' => false,
                'message' => 'No files found in the request',
                'errors' => ['files' => ['The files field is required.']],
            ], 422);
        }

        // Get files and validate them
        $files = $request->file('files');
        if (!is_array($files)) {
            $files = [$files];
        }

        // Validate file count
        if (empty($files)) {
            return response()->json([
                'success' => false,
                'message' => 'At least one file is required',
                'errors' => ['files' => ['The files field is required.']],
            ], 422);
        }

        if (count($files) > 5) {
            return response()->json([
                'success' => false,
                'message' => 'Too many files',
                'errors' => ['files' => ['You can upload a maximum of 5 files.']],
            ], 422);
        }

        // Validate individual files
        $allowedMimes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif'];
        $maxSize = 51200; // 50MB in KB

        foreach ($files as $index => $file) {
            if (!$file->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => "File {$index}: Upload error",
                    'errors' => ['files' => ["File {$index} failed to upload properly."]],
                ], 422);
            }

            // Check file size (in bytes: max 50MB)
            if ($file->getSize() > $maxSize * 1024) {
                return response()->json([
                    'success' => false,
                    'message' => "File {$index}: File size exceeds 50MB",
                    'errors' => ['files' => ["File {$index} exceeds the 50MB size limit."]],
                ], 422);
            }

            // Check file extension
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, $allowedMimes)) {
                return response()->json([
                    'success' => false,
                    'message' => "File {$index}: File type not allowed",
                    'errors' => ['files' => ["File {$index} has an unsupported file type. Allowed: " . implode(', ', $allowedMimes)]],
                ], 422);
            }
        }

        // Validate other fields
        try {
            $validated = $request->validate([
                'description' => ['nullable', 'string', 'max:1000'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        // Get authenticated user (student)
        $user = Auth::user();
        if (!$user || $user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only students can upload records.',
            ], 403);
        }

        // Check if student is verified
        if (!$user->is_admin_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has not been verified by the admin yet. Please wait for verification before uploading records.',
            ], 403);
        }

        // Create or get existing record of this type for the student
        $record = StudentRecord::where('user_id', $user->id)
            ->where('record_type', $recordType->name)
            ->first();

        if (!$record) {
            $record = StudentRecord::create([
                'user_id' => $user->id,
                'record_type' => $recordType->name,
                'record_type_id' => $recordType->id,
                'title' => $recordType->name,
                'description' => $validated['description'] ?? null,
                'verification_status' => 'pending',
            ]);
        } else {
            // Update description if provided
            if (isset($validated['description'])) {
                $record->description = $validated['description'];
                $record->save();
            }
        }

        // Store multiple files
        if ($request->hasFile('files')) {
            $uploadedFiles = $request->file('files');
            
            // Ensure files is always an array
            if (!is_array($uploadedFiles)) {
                $uploadedFiles = [$uploadedFiles];
            }
            
            $currentFileCount = $record->files()->count();
            $newFileCount = count($uploadedFiles);

            if ($currentFileCount + $newFileCount > 5) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maximum 5 files allowed per record',
                    'errors' => ['files' => ['Maximum 5 files total. Currently has ' . $currentFileCount . ' file(s).']],
                ], 422);
            }

            foreach ($uploadedFiles as $file) {
                $path = $file->store("student_records/{$user->id}", 'public');
                $record->files()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $record->load(['files']);

        return response()->json([
            'success' => true,
            'message' => 'Record uploaded successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * Get all records for the authenticated student.
     */
    public function studentRecords(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only students can view their own records.',
            ], 403);
        }

        $records = StudentRecord::where('user_id', $user->id)
            ->with('files')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }

    /**
     * Get pending records for verification (admin only).
     */
    public function getPendingVerification(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can view pending records.',
            ], 403);
        }

        $query = StudentRecord::with([
                'user:id,firstname,lastname,email',
                'files' => function ($q) {
                    // Explicitly select file columns to ensure they're included
                    $q->select('id', 'student_record_id', 'file_path', 'file_name', 'file_type', 'file_size', 'created_at')
                      ->withoutTrashed(); // Include only non-deleted files
                }
            ])
            ->where('verification_status', 'pending')
            ->orderBy('created_at', 'asc');

        // Filter by record type if provided
        if ($request->has('record_type') && $request->record_type) {
            $query->where('record_type', $request->record_type);
        }

        // Search by student name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                  ->orWhere('lastname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = max(1, min($request->get('per_page', 10), 100));
        $records = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $records->items(),
            'pagination' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'total' => $records->total(),
                'per_page' => $records->perPage(),
            ],
        ]);
    }

    /**
     * Verify or reject a pending record (admin only).
     */
    public function verifyRecord(Request $request, StudentRecord $record)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can verify records.',
            ], 403);
        }

        if ($record->verification_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This record has already been verified.',
            ], 422);
        }

        $validated = $request->validate([
            'action' => ['required', 'in:approve,reject'],
        ]);

        if ($validated['action'] === 'approve') {
            $record->verification_status = 'verified';
            $record->verified_by = $user->id;
            $record->verified_at = now();
            $message = 'Record verified successfully';
        } else {
            $record->verification_status = 'rejected';
            $record->verified_by = $user->id;
            $record->verified_at = now();
            $message = 'Record rejected';
        }

        $record->save();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $record->load(['user', 'files']),
        ]);
    }

    /**
     * Get the authenticated student's own records checklist.
     */
    public function studentRecordsChecklist(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only students can view their own records checklist.',
            ], 403);
        }

        try {
            // Get all record types
            $recordTypes = RecordType::select('id', 'name')->orderBy('name')->get();

            // Get all student's records grouped by type
            $studentRecords = StudentRecord::where('user_id', $user->id)
                ->select('id', 'user_id', 'record_type', 'verification_status', 'created_at')
                ->get();

            // Build checklist data for student
            $recordsMap = [];
            
            foreach ($recordTypes as $type) {
                // Filter records for this type
                $typeRecords = $studentRecords->filter(function ($record) use ($type) {
                    return $record->record_type === $type->name;
                });
                
                // Only count verified records as submitted
                $verifiedRecords = $typeRecords->where('verification_status', 'verified');
                
                $recordsMap[$type->name] = [
                    'count' => $verifiedRecords->count(),
                    'submitted' => $verifiedRecords->count() > 0,
                    'verified' => $verifiedRecords->count(),
                    'pending' => $typeRecords->where('verification_status', 'pending')->count(),
                    'rejected' => $typeRecords->where('verification_status', 'rejected')->count(),
                ];
            }

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
                    'records' => $recordsMap,
                    'record_types' => $types,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Student records checklist error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load records checklist: ' . $e->getMessage(),
            ], 500);
        }
    }
}
