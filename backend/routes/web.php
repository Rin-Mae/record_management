<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticateController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentRecordController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ActivityLogController;

Route::get('/', function () {
    return view('welcome');
});

// SPA authentication endpoints (use `web` middleware so sessions/cookies work)
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthenticateController::class, 'login']);
    Route::post('/register', [AuthenticateController::class, 'register']);
    Route::post('/logout', [AuthenticateController::class, 'logout']);
    Route::get('/user', [AuthenticateController::class, 'user']);

    // Student CRUD routes (protected by auth)
    Route::middleware('auth')->group(function () {
        Route::get('/students/statistics', [StudentController::class, 'statistics']);
        Route::apiResource('students', StudentController::class);

        // Course management routes
        Route::get('/courses/all', [CourseController::class, 'all']);
        Route::get('/courses/statistics', [CourseController::class, 'statistics']);
        Route::apiResource('courses', CourseController::class);

        // Records management by type
        Route::get('/records/types', [StudentRecordController::class, 'types']);
        Route::get('/records/type/{type}', [StudentRecordController::class, 'byType']);
        Route::post('/records/type/{type}', [StudentRecordController::class, 'storeByType']);
        Route::put('/records/type/{type}/{record}', [StudentRecordController::class, 'updateByType']);
        Route::delete('/records/type/{type}/{record}', [StudentRecordController::class, 'destroyByType']);

        // (Enrollment list functionality removed)

        // User management routes
        Route::get('/users/statistics', [UserController::class, 'statistics']);
        Route::apiResource('users', UserController::class);

        // Activity logs routes
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/models', [ActivityLogController::class, 'models']);
        Route::get('/activity-logs/actions', [ActivityLogController::class, 'actions']);
    });
});
