<?php

namespace App\Observers;

use App\Models\Course;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class CourseObserver
{
    /**
     * Get the current user's name.
     */
    private function getUserName()
    {
        if (Auth::check()) {
            $user = Auth::user();
            return "{$user->firstname} {$user->lastname}";
        }
        return 'System';
    }

    /**
     * Handle the Course "created" event.
     */
    public function created(Course $course): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => $this->getUserName(),
            'model' => 'Course',
            'model_id' => $course->id,
            'action' => 'created',
            'new_values' => $course->toArray(),
        ]);
    }

    /**
     * Handle the Course "updated" event.
     */
    public function updated(Course $course): void
    {
        $changes = $course->getChanges();
        
        if (!empty($changes)) {
            // Build old values by extracting only the changed attributes from original
            $oldValues = [];
            foreach (array_keys($changes) as $key) {
                $oldValues[$key] = $course->getOriginal($key);
            }
            
            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => $this->getUserName(),
                'model' => 'Course',
                'model_id' => $course->id,
                'action' => 'updated',
                'old_values' => $oldValues,
                'new_values' => $changes,
            ]);
        }
    }

    /**
     * Handle the Course "deleted" event.
     */
    public function deleted(Course $course): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => $this->getUserName(),
            'model' => 'Course',
            'model_id' => $course->id,
            'action' => 'deleted',
            'old_values' => $course->toArray(),
        ]);
    }
}
