<?php

namespace App\Observers;

use App\Models\RecordFile;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
class RecordFileObserver
{
    /**
     * Handle the RecordFile "created" event.
     */
    public function created(RecordFile $recordFile): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
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
         ActivityLog::create([
            'user_id' => Auth::id(),
            'model' => 'RecordFile',
            'model_id' => $recordFile->id,
            'action' => 'updated',
            'old_values' => $recordFile->getOriginal(),
            'new_values' => $recordFile->getChanges(),
        ]);
    }

    /**
     * Handle the RecordFile "deleted" event.
     */
    public function deleted(RecordFile $recordFile): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
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
