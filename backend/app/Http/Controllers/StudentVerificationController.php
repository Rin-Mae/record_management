<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class StudentVerificationController extends Controller
{
    /**
     * Get all pending student verifications
     */
    public function pending()
    {
        $students = User::where('role', 'student')
            ->where('email_verified_at', '!=', null)
            ->where('is_admin_verified', false)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $students,
        ]);
    }

    /**
     * Get all verified students
     */
    public function verified()
    {
        $students = User::where('role', 'student')
            ->where('is_admin_verified', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $students,
        ]);
    }

    /**
     * Get rejected student verifications
     */
    public function rejected()
    {
        $students = User::where('role', 'student')
            ->where('email_verified_at', '!=', null)
            ->where('is_admin_verified', false)
            ->whereNotNull('verification_rejected_reason')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $students,
        ]);
    }

    /**
     * Approve a student verification
     * Makes the student visible and accessible in the system.
     */
    public function approve($id)
    {
        $student = User::findOrFail($id);

        if ($student->role !== 'student') {
            return response()->json([
                'status' => false,
                'message' => 'Only student accounts can be approved.',
            ], 400);
        }

        $student->update([
            'is_admin_verified' => true,
            'verification_rejected_reason' => null,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Student account approved successfully.',
            'data' => $student,
        ]);
    }

    /**
     * Reject a student verification
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $student = User::findOrFail($id);

        if ($student->role !== 'student') {
            return response()->json([
                'status' => false,
                'message' => 'Only student accounts can be rejected.',
            ], 400);
        }

        $student->update([
            'is_admin_verified' => false,
            'verification_rejected_reason' => $validated['reason'],
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Student registration rejected.',
            'data' => $student,
        ]);
    }

    /**
     * Delete a pending student application
     */
    public function deleteApplication($id)
    {
        $student = User::findOrFail($id);

        if ($student->role !== 'student') {
            return response()->json([
                'status' => false,
                'message' => 'Only student accounts can be deleted.',
            ], 400);
        }

        if ($student->is_admin_verified) {
            return response()->json([
                'status' => false,
                'message' => 'Cannot delete approved student accounts.',
            ], 400);
        }

        $student->forceDelete();

        return response()->json([
            'status' => true,
            'message' => 'Student application deleted.',
        ]);
    }
}
