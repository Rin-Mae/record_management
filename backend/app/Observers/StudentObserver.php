<?php

namespace App\Observers;

use App\Models\Student;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class StudentObserver
{
    /**
     * Get the current authenticated user's full name
     */
    private function getUserName()
    {
        $user = Auth::user();
        return $user ? "{$user->firstname} {$user->lastname}" : null;
    }

    /**
     * Handle the Student "created" event.
     */
    public function created(Student $student)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => $this->getUserName(),
            'model' => 'Student',
            'model_id' => $student->id,
            'action' => 'created',
            'new_values' => $student->toArray(),
        ]);
    }


    /**
     * Handle the Student "updated" event.
     */
    public function updated(Student $student)
    {
        $changes = $student->getChanges();
        
        if (!empty($changes)) {
            // Build old values by extracting only the changed attributes from original
            $oldValues = [];
            foreach (array_keys($changes) as $key) {
                $oldValues[$key] = $student->getOriginal($key);
            }
            
            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => $this->getUserName(),
                'model' => 'Student',
                'model_id' => $student->id,
                'action' => 'updated',
                'old_values' => $oldValues,
                'new_values' => $changes,
            ]);
        }
    }

    /**
     * Handle the Student "deleted" event.
     */
    public function deleted(Student $student)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => $this->getUserName(),
            'model' => 'Student',
            'model_id' => $student->id,
            'action' => 'deleted',
            'old_values' => $student->toArray(),
        ]);
    }

    /**
     * Handle the Student "restored" event.
     */
    public function restored(Student $student): void
    {
        //
    }

    /**
     * Handle the Student "force deleted" event.
     */
    public function forceDeleted(Student $student): void
    {
        //
    }
}
