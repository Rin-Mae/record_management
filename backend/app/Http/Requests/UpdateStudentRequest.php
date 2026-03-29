<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->role === 'admin' || $this->user()->role === 'staff');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $studentId = $this->route('student')->id;

        return [
            'student_id' => ['sometimes', 'required', 'string', 'max:50', 'regex:/^[A-Z0-9\-]+$/', Rule::unique('students', 'student_id')->ignore($studentId)],
            'firstname' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'middlename' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'lastname' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z ]+$/'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('students', 'email')->ignore($studentId)],
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
            'student_id.unique' => 'This student ID is already taken.',
            'student_id.regex' => 'Student ID can only contain uppercase letters, numbers, and hyphens.',
            'firstname.regex' => 'First name can only contain letters and spaces.',
            'lastname.regex' => 'Last name can only contain letters and spaces.',
            'email.unique' => 'This email address is already used.',
            'contact_number.regex' => 'Contact number must be a valid format.',
        ];
    }
}
