<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRecordRequest extends FormRequest
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
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'files' => ['required', 'array', 'min:1', 'max:5'],
            'files.*' => [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'Student is required.',
            'student_id.exists' => 'The selected student does not exist.',
            'files.required' => 'At least one file is required.',
            'files.min' => 'At least one file must be uploaded.',
            'files.max' => 'Maximum 5 files can be uploaded at once.',
            'files.*.required' => 'All selected files are required.',
            'files.*.file' => 'Each item must be a valid file.',
            'files.*.max' => 'Each file cannot exceed 10MB.',
            'files.*.mimes' => 'Files must be of type: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, or gif.',
        ];
    }
}
