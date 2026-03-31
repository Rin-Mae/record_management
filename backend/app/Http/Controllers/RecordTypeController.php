<?php

namespace App\Http\Controllers;

use App\Models\RecordType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RecordTypeController extends Controller
{
    /**
     * Display a listing of all record types.
     */
    public function index(Request $request)
    {
        $query = RecordType::query();

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search by name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $recordTypes = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($recordTypes);
    }

    /**
     * Get all active record types (for dropdowns).
     */
    public function getActive()
    {
        $recordTypes = RecordType::orderBy('name')
            ->get(['id', 'name']);

        return response()->json($recordTypes);
    }

    /**
     * Store a newly created record type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:record_types',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $recordType = RecordType::create($validated);

        return response()->json($recordType, 201);
    }

    /**
     * Display the specified record type.
     */
    public function show(RecordType $recordType)
    {
        return response()->json($recordType);
    }

    /**
     * Update the specified record type.
     */
    public function update(Request $request, RecordType $recordType)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('record_types')->ignore($recordType->id),
            ],
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $recordType->update($validated);

        return response()->json($recordType);
    }

    /**
     * Delete the specified record type.
     */
    public function destroy(RecordType $recordType)
    {
        // Check if record type has associated student records
        if ($recordType->studentRecords()->exists()) {
            return response()->json(
                ['message' => 'Cannot delete record type with associated records.'],
                422
            );
        }

        $recordType->delete();

        return response()->json(['message' => 'Record type deleted successfully']);
    }
}
