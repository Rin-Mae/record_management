<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'model',
        'model_id',
        'action',
        'old_values',
        'new_values'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Get the user who performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for searching activity logs by model, model_id, or action.
     */
    public function scopeSearch($query, $searchTerm)
    {
        if (!$searchTerm) {
            return $query;
        }

        // Normalize search term
        $searchTerm = trim($searchTerm);
        $searchPattern = "%{$searchTerm}%";

        return $query->where(function ($q) use ($searchPattern) {
            $q->where('model', 'like', $searchPattern)
              ->orWhere('model_id', 'like', $searchPattern)
              ->orWhere('action', 'like', $searchPattern);
        });
    }

    /**
     * Scope for filtering by model type.
     */
    public function scopeByModel($query, $modelType)
    {
        if (!$modelType) {
            return $query;
        }

        return $query->where('model', $modelType);
    }

    /**
     * Scope for filtering by action.
     */
    public function scopeByAction($query, $action)
    {
        if (!$action) {
            return $query;
        }

        return $query->where('action', $action);
    }
}