<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'string', 'max:50', 'unique:users,student_id', 'regex:/^[A-Z0-9\-]+$/'],
            'firstname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'age' => ['nullable', 'integer', 'min:1', 'max:150'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_number' => ['nullable', 'string', 'max:20', 'regex:/^0[0-9]{10}$/'],
            'gender' => ['nullable', 'in:male,female,other'],
            'course' => ['nullable', 'string', 'max:255'],
            'year_level' => ['nullable', 'integer', 'min:1', 'max:10'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'Student ID is required.',
            'student_id.unique' => 'This student ID already exists.',
            'student_id.regex' => 'Student ID can only contain uppercase letters, numbers, and hyphens.',
            'firstname.required' => 'First name is required.',
            'firstname.regex' => 'First name can only contain letters and spaces.',
            'lastname.required' => 'Last name is required.',
            'lastname.regex' => 'Last name can only contain letters and spaces.',
            'email.unique' => 'This email address is already used.',
            'contact_number.regex' => 'Contact number must be a valid format.',
            'year_level.min' => 'Year level must be at least 1.',
            'year_level.max' => 'Year level cannot exceed 10.',
        ];
    }
}
