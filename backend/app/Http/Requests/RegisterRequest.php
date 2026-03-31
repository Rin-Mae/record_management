<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'string', 'size:8', 'regex:/^\d{8}$/', 'unique:users,student_id'],
            'firstname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'birthdate' => ['required', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'regex:/^0[0-9]{10}$/'],
            'gender' => ['required', 'in:male,female'],
            'course_id' => ['required', 'exists:courses,id'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'Student ID is required.',
            'student_id.size' => 'Student ID must be exactly 8 numbers.',
            'student_id.regex' => 'Student ID must contain only numbers.',
            'student_id.unique' => 'This student ID already exists.',
            'firstname.required' => 'First name is required.',
            'firstname.regex' => 'First name can only contain letters and spaces.',
            'lastname.required' => 'Last name is required.',
            'lastname.regex' => 'Last name can only contain letters and spaces.',
            'birthdate.required' => 'Birthdate is required.',
            'birthdate.before' => 'Birthdate must be in the past.',
            'contact_number.regex' => 'Contact number must be a valid Philippine number (0XXXXXXXXXX).',
            'course_id.required' => 'Course is required.',
            'course_id.exists' => 'Selected course does not exist.',
            'email.unique' => 'This email address is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
