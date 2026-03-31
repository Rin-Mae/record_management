<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRecordRequest extends FormRequest
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
            'student_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'files' => ['nullable', 'array', 'max:5'],
            'files.*' => [
                'nullable',
                'file',
                'max:10240', // 10MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif',
            ],
            'remove_file_ids' => ['nullable', 'array'],
            'remove_file_ids.*' => ['integer', 'exists:record_files,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_id.exists' => 'The selected student does not exist.',
            'files.max' => 'Maximum 5 files can be uploaded.',
            'files.*.file' => 'Each item must be a valid file.',
            'files.*.max' => 'Each file cannot exceed 10MB.',
            'files.*.mimes' => 'Files must be of type: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, or gif.',
            'remove_file_ids.*.exists' => 'One or more files to remove do not exist.',
        ];
    }
}
