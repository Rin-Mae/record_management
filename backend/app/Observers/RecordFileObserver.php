<?php

namespace App\Observers;

use App\Models\RecordFile;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class RecordFileObserver
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
     * Handle the RecordFile "created" event.
     */
    public function created(RecordFile $recordFile): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => $this->getUserName(),
            'model' => 'RecordFile',
            'model_id' => $recordFile->id,
            'action' => 'created',
            'new_values' => $recordFile->toArray(),
        ]);
    }

    /**
     * Handle the RecordFile "updated" event.
     */
    public function updated(RecordFile $recordFile): void
    {
        $changes = $recordFile->getChanges();
        
        if (!empty($changes)) {
            // Build old values by extracting only the changed attributes from original
            $oldValues = [];
            foreach (array_keys($changes) as $key) {
                $oldValues[$key] = $recordFile->getOriginal($key);
            }
            
            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => $this->getUserName(),
                'model' => 'RecordFile',
                'model_id' => $recordFile->id,
                'action' => 'updated',
                'old_values' => $oldValues,
                'new_values' => $changes,
            ]);
        }
    }

    /**
     * Handle the RecordFile "deleted" event.
     */
    public function deleted(RecordFile $recordFile): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => $this->getUserName(),
            'model' => 'RecordFile',
            'model_id' => $recordFile->id,
            'action' => 'deleted',
            'old_values' => $recordFile->toArray(),
        ]);
    }

    /**
     * Handle the RecordFile "restored" event.
     */
    public function restored(RecordFile $recordFile): void
    {
        //
    }

    /**
     * Handle the RecordFile "force deleted" event.
     */
    public function forceDeleted(RecordFile $recordFile): void
    {
        //
    }
}
