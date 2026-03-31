<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. We're enabling credentials and allowing the
    | frontend origin defined in the environment.
    |
    */

    'paths' => [
        'api/*',
        'csrf-token',
        'sanctum/csrf-cookie',
        'auth/*',
        'login',
        'register',
        'logout',
        'user',
        'users',
        'users/*',
        'students',
        'students/*',
        'courses',
        'courses/*',
        'record-types',
        'record-types/*',
        'records/*',
        'my-records',
        'my-records/*',
        'activity-logs',
        'activity-logs/*',
        'dashboard/*',
        'student-verifications/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-CSRF-TOKEN'],

    'max_age' => 0,

    'supports_credentials' => true,
];