<?php

namespace App\Observers;

use App\Models\StudentRecord;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
class StudentRecordObserver
{
    /**
     * Handle the StudentRecord "created" event.
     */
    public function created(StudentRecord $record)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'model' => 'StudentRecord',
            'model_id' => $record->id,
            'action' => 'created',
            'new_values' => $record->toArray(),
        ]);
    }

    /**
     * Handle the StudentRecord "updated" event.
     */
    public function updated(StudentRecord $record)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'model' => 'StudentRecord',
            'model_id' => $record->id,
            'action' => 'updated',
            'old_values' => $record->getOriginal(),
            'new_values' => $record->getChanges(),
        ]);
    }

    /**
     * Handle the StudentRecord "deleted" event.
     */
    public function deleted(StudentRecord $studentRecord): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'model' => 'StudentRecord',
            'model_id' => $studentRecord->id,
            'action' => 'deleted',
            'old_values' => $studentRecord->toArray(),
        ]);
    }

    /**
     * Handle the StudentRecord "restored" event.
     */
    public function restored(StudentRecord $studentRecord): void
    {
        //
    }

    /**
     * Handle the StudentRecord "force deleted" event.
     */
    public function forceDeleted(StudentRecord $studentRecord): void
    {
        //
    }
}
