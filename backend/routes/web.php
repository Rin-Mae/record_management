<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticateController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentRecordController;
use App\Http\Controllers\EnrollmentListController;
use App\Http\Controllers\UserController;

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

        // Records management by type
        Route::get('/records/types', [StudentRecordController::class, 'types']);
        Route::get('/records/type/{type}', [StudentRecordController::class, 'byType']);
        Route::post('/records/type/{type}', [StudentRecordController::class, 'storeByType']);
        Route::put('/records/type/{type}/{record}', [StudentRecordController::class, 'updateByType']);
        Route::delete('/records/type/{type}/{record}', [StudentRecordController::class, 'destroyByType']);

        // Enrollment List routes
        Route::get('/enrollment-lists', [EnrollmentListController::class, 'index']);
        Route::post('/enrollment-lists', [EnrollmentListController::class, 'store']);
        Route::put('/enrollment-lists/{enrollmentList}', [EnrollmentListController::class, 'update']);
        Route::delete('/enrollment-lists/{enrollmentList}', [EnrollmentListController::class, 'destroy']);
        Route::get('/enrollment-lists/{enrollmentList}/students', [EnrollmentListController::class, 'students']);
        Route::post('/enrollment-lists/{enrollmentList}/students', [EnrollmentListController::class, 'addStudents']);
        Route::delete('/enrollment-lists/{enrollmentList}/students/{student}', [EnrollmentListController::class, 'removeStudent']);

        // User management routes
        Route::get('/users/statistics', [UserController::class, 'statistics']);
        Route::apiResource('users', UserController::class);
    });
});
