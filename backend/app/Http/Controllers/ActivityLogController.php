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
        $perPage = max(10, min($request->get('per_page', 10), 100)); // Minimum 10 per page, default 10, max 100
        $search = $request->get('search', '');
        $model = $request->get('model', '');
        $action = $request->get('action', '');

        $query = ActivityLog::with(['user' => fn($q) => $q->select('id', 'firstname', 'lastname', 'email')->withTrashed()])
            ->select('id', 'user_id', 'user_name', 'model', 'model_id', 'action', 'old_values', 'new_values', 'created_at');

        // Apply search if provided
        if ($search) {
            $query->search($search);
        }

        // Apply model filter
        if ($model) {
            $query->byModel($model);
        }

        // Apply action filter
        if ($action) {
            $query->byAction($action);
        }

        // Order by created_at descending
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
