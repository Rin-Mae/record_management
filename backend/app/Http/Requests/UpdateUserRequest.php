<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow users to update their own profile, and admins to update any user
        $userToUpdate = $this->route('user');
        return $this->user() && 
               ($this->user()->id === $userToUpdate->id || 
                $this->user()->role === 'admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'firstname' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'username' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_\-\.]+$/', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'birthdate' => ['nullable', 'date', 'before_or_equal:today'],
            'age' => ['nullable', 'integer', 'min:1', 'max:120'],
            'gender' => ['nullable', 'string', 'in:Male,Female,Other,Prefer not to say'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_number' => ['nullable', 'string', 'regex:/^(0|\+63)[0-9]{9,10}$/'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/'],
            'password_confirmation' => ['nullable', 'string'],
            'role' => ['sometimes', 'required', 'in:admin'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'firstname.regex' => 'First name can only contain letters and spaces.',
            'lastname.regex' => 'Last name can only contain letters and spaces.',
            'username.regex' => 'Username can only contain letters, numbers, underscores, hyphens, and periods.',
            'username.unique' => 'This username is already taken.',
            'email.unique' => 'This email address is already registered.',
            'birthdate.before_or_equal' => 'Birthdate cannot be in the future.',
            'age.min' => 'Age must be at least 1.',
            'age.max' => 'Age must be less than 120.',
            'gender.in' => 'Please select a valid gender option.',
            'contact_number.regex' => 'Contact number must be a valid Philippine number (0XXXXXXXXXX).',
            'password.min' => 'Password must be at least 8 characters.',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}