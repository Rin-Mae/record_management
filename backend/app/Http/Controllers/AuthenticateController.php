<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use App\Mail\VerifyEmailMail;

class AuthenticateController extends Controller
{

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $age = Carbon::parse($validated['birthdate'])->age;
        
        // Generate OTP (6 digits)
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'student_id' => $validated['student_id'],
            'firstname' => $validated['firstname'],
            'middlename' => $validated['middlename'],
            'lastname' => $validated['lastname'],
            'age' => $age,
            'birthdate' => $validated['birthdate'],
            'address' => $validated['address'],
            'contact_number' => $validated['contact_number'],
            'gender' => $validated['gender'],
            'course_id' => $validated['course_id'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'student',
            'email_verification_otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        \Log::info('User registered with OTP', [
            'email' => $user->email,
            'otp_generated' => true,
            'otp_expires_at' => $user->otp_expires_at,
        ]);

        // Send verification email with OTP
        try {
            Mail::to($user->email)->send(new VerifyEmailMail($user, $otp));
            \Log::info('Verification email sent', ['email' => $user->email]);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json([
            'status' => true,
            'message' => 'Registration successful! Please check your email for the OTP verification code.',
            'email' => $user->email,
        ], 201);
    }

    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required|string|size:6',
            'email' => 'required|email',
        ]);

        \Log::info('Email verification attempt with OTP', [
            'email' => $validated['email'],
            'otp_received' => $validated['otp'],
        ]);

        // Find user by email
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            \Log::warning('User not found for email verification', ['email' => $validated['email']]);
            return response()->json([
                'status' => false,
                'message' => 'User not found.',
            ], 400);
        }

        \Log::info('User found', [
            'email' => $user->email,
            'has_otp' => !empty($user->email_verification_otp),
            'already_verified' => !empty($user->email_verified_at),
        ]);

        // Check if already verified
        if ($user->email_verified_at) {
            \Log::info('Email already verified', ['email' => $validated['email']]);
            return response()->json([
                'status' => true,
                'message' => 'Email already verified.',
            ], 200);
        }

        // Check if OTP exists
        if (!$user->email_verification_otp) {
            \Log::warning('No verification OTP stored for user', ['email' => $validated['email']]);
            return response()->json([
                'status' => false,
                'message' => 'No OTP found. Please register again.',
            ], 400);
        }

        // Check if OTP has expired
        if ($user->otp_expires_at && now()->isAfter($user->otp_expires_at)) {
            \Log::warning('OTP expired', ['email' => $validated['email']]);
            return response()->json([
                'status' => false,
                'message' => 'OTP has expired. Please request a new one.',
            ], 400);
        }

        // Verify OTP matches
        if ($validated['otp'] !== $user->email_verification_otp) {
            \Log::warning('OTP mismatch', [
                'email' => $validated['email'],
                'expected' => $user->email_verification_otp,
                'received' => $validated['otp'],
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Invalid OTP. Please check and try again.',
            ], 400);
        }

        // OTP is valid - mark email as verified
        $user->update([
            'email_verified_at' => now(),
            'email_verification_otp' => null,
            'otp_expires_at' => null,
        ]);

        \Log::info('Email verified successfully', ['email' => $validated['email']]);

        return response()->json([
            'status' => true,
            'message' => 'Email verified successfully! Please visit the registrar\'s office with your student ID.',
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        \Log::info('OTP resend requested', ['email' => $validated['email']]);

        // Find user by email
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            \Log::warning('User not found for OTP resend', ['email' => $validated['email']]);
            return response()->json([
                'status' => false,
                'message' => 'User not found.',
            ], 400);
        }

        // Check if already verified
        if ($user->email_verified_at) {
            \Log::info('Email already verified, no need to resend', ['email' => $validated['email']]);
            return response()->json([
                'status' => false,
                'message' => 'Email is already verified.',
            ], 400);
        }

        // Generate new OTP (6 digits)
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Update user with new OTP
        $user->update([
            'email_verification_otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        \Log::info('New OTP generated and stored', [
            'email' => $user->email,
            'otp_expires_at' => $user->otp_expires_at,
        ]);

        // Send OTP email
        try {
            Mail::to($user->email)->send(new VerifyEmailMail($user, $otp));
            \Log::info('OTP resend email sent', ['email' => $user->email]);
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP resend email: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to send OTP. Please try again later.',
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'A new OTP has been sent to your email.',
            'email' => $user->email,
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

        // Check if student account is email verified
        if ($user->role === 'student' && !$user->email_verified_at) {
            Auth::guard('web')->logout();
            return response()->json([
                'status' => false,
                'message' => 'Please verify your email address first.',
            ], 403);
        }

        // Check if student account is admin verified
        if ($user->role === 'student' && !$user->is_admin_verified) {
            Auth::guard('web')->logout();
            return response()->json([
                'status' => false,
                'message' => 'Your account is pending admin verification.',
                'reason' => $user->verification_rejected_reason,
            ], 403);
        }

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