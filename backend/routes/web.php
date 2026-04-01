<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticateController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentRecordController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\StudentVerificationController;
use App\Http\Controllers\RecordTypeController;

Route::get('/', function () {
    return view('welcome');
});

// CSRF token endpoint (no middleware needed - will still have session via prepended HandleCors)
Route::get('/csrf-token', function () {
    $token = csrf_token();
    return response()->json(['token' => $token])
        ->header('X-CSRF-TOKEN', $token);
});

// Public courses endpoint for registration (no auth required)
Route::get('/courses/all', [CourseController::class, 'all']);

// SPA authentication endpoints (use `web` middleware for session)
Route::group(['middleware' => 'web'], function () {
    // Bypass CSRF for public auth endpoints
    Route::withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)->group(function () {
        Route::post('/auth/register', [AuthenticateController::class, 'register']);
        Route::post('/auth/login', [AuthenticateController::class, 'login']);
        Route::post('/auth/verify-email', [AuthenticateController::class, 'verifyEmail']);
        Route::post('/auth/resend-otp', [AuthenticateController::class, 'resendOtp']);
    });
    
    // Protected endpoints with CSRF
    Route::middleware('auth')->group(function () {
        Route::post('/auth/logout', [AuthenticateController::class, 'logout']);
        Route::get('/auth/user', [AuthenticateController::class, 'user']);
    });

    // Student CRUD routes (protected by auth)
    Route::middleware('auth')->group(function () {
        // Student verification routes (admin only)
        Route::get('/student-verifications/pending', [StudentVerificationController::class, 'pending']);
        Route::get('/student-verifications/verified', [StudentVerificationController::class, 'verified']);
        Route::get('/student-verifications/rejected', [StudentVerificationController::class, 'rejected']);
        Route::post('/student-verifications/{id}/approve', [StudentVerificationController::class, 'approve']);
        Route::post('/student-verifications/{id}/reject', [StudentVerificationController::class, 'reject']);
        Route::delete('/student-verifications/{id}', [StudentVerificationController::class, 'deleteApplication']);

        Route::get('/students/statistics', [StudentController::class, 'statistics']);
        Route::get('/students/record-statistics', [StudentController::class, 'recordStatistics']);
        Route::get('/students/records-checklist', [StudentController::class, 'recordsChecklist']);
        Route::get('/students/verified-with-records/{type}', [StudentController::class, 'verifiedStudentsWithRecords']);
        Route::apiResource('students', StudentController::class);

        // Course management routes
        Route::get('/courses/statistics', [CourseController::class, 'statistics']);
        Route::apiResource('courses', CourseController::class);

        // Record type management routes
        Route::get('/record-types/active', [RecordTypeController::class, 'getActive']);
        Route::apiResource('record-types', RecordTypeController::class);

        // Records management by type
        Route::get('/records/types', [StudentRecordController::class, 'types']);
        Route::get('/records/type/{type}', [StudentRecordController::class, 'byType']);
        Route::post('/records/type/{type}', [StudentRecordController::class, 'storeByType']);
        Route::put('/records/type/{type}/{record}', [StudentRecordController::class, 'updateByType']);
        Route::delete('/records/type/{type}/{record}', [StudentRecordController::class, 'destroyByType']);
        
        // Student record upload endpoints (for students to upload their own records)
        Route::post('/my-records/type/{type}', [StudentRecordController::class, 'studentStoreByType']);
        Route::get('/my-records', [StudentRecordController::class, 'studentRecords']);

        // Record verification endpoints (admin only)
        Route::get('/records/pending-verification', [StudentRecordController::class, 'getPendingVerification']);
        Route::post('/records/{record}/verify', [StudentRecordController::class, 'verifyRecord']);

        // User management routes
        Route::get('/users/statistics', [UserController::class, 'statistics']);
        Route::apiResource('users', UserController::class);

        // Activity logs routes
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/models', [ActivityLogController::class, 'models']);
        Route::get('/activity-logs/actions', [ActivityLogController::class, 'actions']);
    });
});