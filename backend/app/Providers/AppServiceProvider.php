<?php

namespace App\Providers;
use App\Models\User;
use App\Models\Student;
use App\Models\StudentRecord;
use App\Models\RecordFile;
use App\Models\Course;

use App\Observers\StudentObserver;
use App\Observers\StudentRecordObserver;
use App\Observers\RecordFileObserver;
use App\Observers\CourseObserver;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Student::observe(StudentObserver::class);
        StudentRecord::observe(StudentRecordObserver::class);
        RecordFile::observe(RecordFileObserver::class);
        Course::observe(CourseObserver::class);
    }
}
