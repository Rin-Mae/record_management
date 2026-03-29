<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Carbon;

class AuthenticateController extends Controller
{

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $age = Carbon::parse($validated['birthdate'])->age;

        $user = User::create([
            'firstname' => $validated['firstname'],
            'middlename' => $validated['middlename'],
            'lastname' => $validated['lastname'],
            'age' => $age,
            'birthdate' => $validated['birthdate'],
            'address' => $validated['address'],
            'contact_number' => $validated['contact_number'],
            'gender' => $validated['gender'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        // Log the user in (start session) so SPA can access protected endpoints
        Auth::login($user);
        $request->session()->regenerate();

        // Get role from user attribute
        $roles = $user->role ? [$user->role] : [];

        return response()->json([
            'user' => $user,
            'roles' => $roles,
            'account_status' => $user->status ?? 'active',
            'status' => true,
            'message' => 'Registration successful.',
        ]);
    }

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $key = (string) ($validated['email'] ?? '') . $request->ip();
        $maxAttempts = 5;
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => 'Too many login attempts. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }

        if (!Auth::attempt($validated)) {
            RateLimiter::hit($key, 300);
            $attempts = RateLimiter::attempts($key);
            $remaining = max(0, $maxAttempts - $attempts);
            return response()->json([
                'message' => 'Invalid credentials',
                'remaining_attempts' => $remaining,
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user && $user->status === 'banned') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Your account has been suspended by the admin',
                'status' => false,
            ], 403);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);

        // Get role from user attribute
        $roles = $user->role ? [$user->role] : [];
        $isAdmin = $user->role === 'admin';

        $message = $isAdmin ? 'Admin logged in successfully' : 'User logged in successfully';

        return response()->json([
            'user' => $user,
            'roles' => $roles,
            'account_status' => $user->status ?? 'active',
            'status' => true,
            'message' => $message,
        ]);
    }

    public function logout(Request $request)
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        $isAdmin = $user && $user->role === 'admin';

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $message = $isAdmin ? 'Admin logged out successfully' : 'User logged out successfully';

        return response()->json(['message' => $message]);
    }

    public function user(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $roles = $user->role ? [$user->role] : [];

        return response()->json([
            'user' => $user,
            'roles' => $roles,
            'account_status' => $user->status ?? 'active',
        ]);
    }
}