<?php

namespace App\Observers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class UserObserver
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
     * Handle the User "created" event.
     * Only log if the user being created is a student (not for admin user creation)
     */
    public function created(User $user)
    {
        // Only log student creations
        if ($user->role === 'student') {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => $this->getUserName(),
                'model' => 'User',
                'model_id' => $user->id,
                'action' => 'created',
                'new_values' => $user->toArray(),
            ]);
        }
    }

    /**
     * Handle the User "updated" event.
     * Only log if the user being updated is a student or if admin is verifying
     */
    public function updated(User $user)
    {
        $changes = $user->getChanges();

        // Only log student updates
        if ($user->role === 'student' && !empty($changes)) {
            // Build old values by extracting only the changed attributes from original
            $oldValues = [];
            foreach (array_keys($changes) as $key) {
                $oldValues[$key] = $user->getOriginal($key);
            }

            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => $this->getUserName(),
                'model' => 'User',
                'model_id' => $user->id,
                'action' => 'updated',
                'old_values' => $oldValues,
                'new_values' => $changes,
            ]);
        }
    }

    /**
     * Handle the User "deleted" event.
     * Only log if the user being deleted is a student
     */
    public function deleted(User $user)
    {
        // Only log student deletions
        if ($user->role === 'student') {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => $this->getUserName(),
                'model' => 'User',
                'model_id' => $user->id,
                'action' => 'deleted',
                'old_values' => $user->toArray(),
            ]);
        }
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
