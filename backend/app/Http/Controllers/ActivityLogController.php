<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Get all activity logs with pagination
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $search = $request->get('search', '');
        $model = $request->get('model', '');
        $action = $request->get('action', '');

        $query = ActivityLog::with(['user:id,firstname,lastname,email' => fn($q) => $q->withTrashed()])
            ->select('id', 'user_id', 'user_name', 'model', 'model_id', 'action', 'created_at');

        // Search by model_id or model type
        if ($search) {
            $query->where('model', 'like', "%{$search}%")
                  ->orWhere('model_id', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
        }

        // Filter by model
        if ($model) {
            $query->where('model', $model);
        }

        // Filter by action
        if ($action) {
            $query->where('action', $action);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ]
        ]);
    }

    /**
     * Get distinct models
     */
    public function models()
    {
        $models = ActivityLog::distinct()->pluck('model')->sort()->values();

        return response()->json([
            'success' => true,
            'data' => $models
        ]);
    }

    /**
     * Get distinct actions
     */
    public function actions()
    {
        $actions = ActivityLog::distinct()->pluck('action')->sort()->values();

        return response()->json([
            'success' => true,
            'data' => $actions
        ]);
    }
}
