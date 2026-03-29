# Form Validation Documentation

## Overview

This document provides a comprehensive guide to the form validation system implemented in the backend using Laravel Form Requests. All validation is centralized in the `app/Http/Requests/` directory.

## Benefits of This Approach

1. **Separation of Concerns** - Validation logic is separated from controller logic
2. **Reusability** - Requests can be reused across multiple controllers
3. **Maintainability** - All validation rules in one place
4. **Authorization** - Built-in authorization checks in requests
5. **Custom Messages** - User-friendly error messages
6. **Consistency** - Uniform validation responses across the API

---

## Form Requests Overview

### Authentication Requests

#### RegisterRequest (`app/Http/Requests/RegisterRequest.php`)

**Endpoint:** `POST /register`

**Rules:**

- `firstname` - Required, string (max 255), letters and spaces only
- `middlename` - Optional, string (max 255), letters and spaces only
- `lastname` - Required, string (max 255), letters and spaces only
- `birthdate` - Required, must be a valid date in the past
- `address` - Required, string (max 255)
- `contact_number` - Required, Philippine phone format (0XXXXXXXXXX)
- `gender` - Required, must be 'male' or 'female'
- `email` - Required, valid email, must be unique
- `password` - Required, min 8 characters, must be confirmed
- `password_confirmation` - Required

**Example Request:**

```json
{
    "firstname": "John",
    "middlename": "Miguel",
    "lastname": "Doe",
    "birthdate": "1995-05-15",
    "address": "123 Main Street",
    "contact_number": "09171234567",
    "gender": "male",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!"
}
```

---

#### LoginRequest (`app/Http/Requests/LoginRequest.php`)

**Endpoint:** `POST /login`

**Rules:**

- `email` - Required, valid email format
- `password` - Required, string

**Example Request:**

```json
{
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

---

### Student Requests

#### StoreStudentRequest (`app/Http/Requests/StoreStudentRequest.php`)

**Endpoint:** `POST /students`

**Authorization:** Requires authentication (admin or staff role)

**Rules:**

- `student_id` - Required, unique, uppercase letters/numbers/hyphens only
- `firstname` - Required, string (max 255), letters and spaces only
- `middlename` - Optional, string (max 255), letters and spaces only
- `lastname` - Required, string (max 255), letters and spaces only
- `email` - Required, unique email
- `birthdate` - Optional, must be a valid date in the past
- `age` - Optional, integer between 1-150
- `address` - Optional, string (max 500)
- `contact_number` - Optional, Philippine phone format
- `gender` - Optional, must be 'male', 'female', or 'other'
- `course` - Optional, string (max 255)
- `year_level` - Optional, integer between 1-10

**Example Request:**

```json
{
    "student_id": "2024-001",
    "firstname": "Maria",
    "lastname": "Santos",
    "email": "maria@example.com",
    "birthdate": "2005-03-20",
    "age": 19,
    "address": "456 Secondary St",
    "contact_number": "09181234567",
    "gender": "female",
    "course": "Computer Science",
    "year_level": 2
}
```

---

#### UpdateStudentRequest (`app/Http/Requests/UpdateStudentRequest.php`)

**Endpoint:** `PUT /students/{student}`

**Authorization:** Requires authentication (admin or staff role)

**Rules:** Same as StoreStudentRequest but with `sometimes` modifier (fields are optional for updates)

---

### User Requests

#### StoreUserRequest (`app/Http/Requests/StoreUserRequest.php`)

**Endpoint:** `POST /users`

**Authorization:** Requires admin role

**Rules:**

- `firstname` - Required, letters and spaces only
- `middlename` - Optional, letters and spaces only
- `lastname` - Required, letters and spaces only
- `username` - Required, unique, alphanumeric with underscores/hyphens/periods
- `email` - Required, unique email
- `password` - Required, min 8 chars, must contain:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character (@$!%\*?&)
- `password_confirmation` - Required
- `role` - Required, must be 'admin' or 'staff'

**Example Request:**

```json
{
    "firstname": "Admin",
    "lastname": "User",
    "username": "admin_user",
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!",
    "role": "admin"
}
```

---

#### UpdateUserRequest (`app/Http/Requests/UpdateUserRequest.php`)

**Endpoint:** `PUT /users/{user}`

**Authorization:** Requires admin role

**Rules:** Same as StoreUserRequest but with `sometimes` modifier for optional updates. Password is nullable for updates (only updated if provided).

---

### Course Requests

#### StoreCourseRequest (`app/Http/Requests/StoreCourseRequest.php`)

**Endpoint:** `POST /courses`

**Authorization:** Requires authentication (admin or staff role)

**Rules:**

- `code` - Required, unique, uppercase/numbers/hyphens only (max 50)
- `name` - Required, string (max 255)
- `department` - Optional, string (max 255)
- `description` - Optional, string (max 1000)

**Example Request:**

```json
{
    "code": "CS-101",
    "name": "Introduction to Computer Science",
    "department": "Engineering",
    "description": "Basic concepts of programming and algorithms"
}
```

---

#### UpdateCourseRequest (`app/Http/Requests/UpdateCourseRequest.php`)

**Endpoint:** `PUT /courses/{course}`

**Authorization:** Requires authentication (admin or staff role)

**Rules:** Same as StoreCourseRequest with unique constraint on code excluding current record

---

### Student Record Requests

#### StoreStudentRecordRequest (`app/Http/Requests/StoreStudentRecordRequest.php`)

**Endpoint:** `POST /records/type/{type}`

**Authorization:** Requires authentication (admin or staff role)

**Rules:**

- `student_id` - Required, must exist in students table
- `files` - Required, array with 1-5 files
- `files.*` - Each file:
    - Must be a valid file
    - Max 10MB
    - Allowed types: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif

**Example Request (multipart/form-data):**

```
student_id: 1
files: [file1.pdf, file2.jpg]
```

---

#### UpdateStudentRecordRequest (`app/Http/Requests/UpdateStudentRecordRequest.php`)

**Endpoint:** `PUT /records/type/{type}/{record}`

**Authorization:** Requires authentication (admin or staff role)

**Rules:**

- `student_id` - Optional, must exist in students table
- `files` - Optional, array with 0-5 files (same validation as store)
- `remove_file_ids` - Optional, array of file IDs to remove (must exist)

**Note:** At least 1 file must remain after updates (enforced in controller)

---

## Validation Error Response Format

When validation fails, the API returns a 422 status code with this structure:

```json
{
    "message": "Validation failed",
    "errors": {
        "field_name": ["Error message for this field"],
        "another_field": ["First error", "Second error"]
    },
    "status": false
}
```

---

## Common Validation Rules

### Regular Expressions Used

| Pattern                                                               | Purpose                             | Example          |
| --------------------------------------------------------------------- | ----------------------------------- | ---------------- |
| `/^[a-zA-Z ]+$/`                                                      | Names (letters and spaces)          | "John Doe"       |
| `/^0[0-9]{10}$/`                                                      | Philippine phone numbers            | "09171234567"    |
| `/^[A-Z0-9\-]+$/`                                                     | Uppercase alphanumeric with hyphens | "CS-101"         |
| `/^[a-zA-Z0-9_\-\.]+$/`                                               | Username characters                 | "user_name-123"  |
| `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/` | Strong password                     | "SecurePass123!" |

---

## Using Form Requests in Controllers

### Example: Creating a Student

**Before (without Form Requests):**

```php
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'student_id' => 'required|string|unique:students',
        // ... more rules
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }

    $student = Student::create($request->validated());
}
```

**After (with Form Requests):**

```php
use App\Http\Requests\StoreStudentRequest;

public function store(StoreStudentRequest $request)
{
    $student = Student::create($request->validated());

    return response()->json([
        'success' => true,
        'data' => $student,
    ], 201);
}
```

---

## Authorization Checks

Form Requests include built-in authorization. For example, in `StoreUserRequest`:

```php
public function authorize(): bool
{
    return auth()->check() && auth()->user()->role === 'admin';
}
```

If authorization fails, the request returns 403 Forbidden automatically.

---

## Custom Messages

Each Form Request includes `messages()` method with user-friendly error messages:

```php
public function messages(): array
{
    return [
        'firstname.required' => 'First name is required.',
        'firstname.regex' => 'First name can only contain letters and spaces.',
        'email.unique' => 'This email address is already registered.',
    ];
}
```

---

## Adding New Validation Rules

To add a new Form Request:

1. Create a new class in `app/Http/Requests/`
2. Extend `FormRequest`
3. Implement `authorize()` method
4. Implement `rules()` method with validation rules
5. Optionally add `messages()` for custom error messages
6. Use the request in your controller method

**Example:**

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'field' => 'required|min:3|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'field.required' => 'This field is required.',
        ];
    }
}
```

---

## Testing Validation

To test the validation, you can use tools like:

- Postman
- Thunder Client
- cURL
- Your frontend application

Send requests with missing or invalid data to see validation errors in action.

---

## Notes

- All timestamps are automatically handled by Laravel
- Soft deletes are configured for users
- Password hashing is handled automatically in controllers
- File uploads are stored in the `public/storage` directory
- Validation runs automatically before the controller method is called
- Failed validations prevent the controller method from executing

---

**Last Updated:** March 30, 2026
