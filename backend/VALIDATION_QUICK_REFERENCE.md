# Form Validation Quick Reference

## Request Classes Map

| Controller              | Method       | Request Class                | Endpoint                        |
| ----------------------- | ------------ | ---------------------------- | ------------------------------- |
| AuthenticateController  | register     | `RegisterRequest`            | `POST /register`                |
| AuthenticateController  | login        | `LoginRequest`               | `POST /login`                   |
| StudentController       | store        | `StoreStudentRequest`        | `POST /students`                |
| StudentController       | update       | `UpdateStudentRequest`       | `PUT /students/{id}`            |
| UserController          | store        | `StoreUserRequest`           | `POST /users`                   |
| UserController          | update       | `UpdateUserRequest`          | `PUT /users/{id}`               |
| CourseController        | store        | `StoreCourseRequest`         | `POST /courses`                 |
| CourseController        | update       | `UpdateCourseRequest`        | `PUT /courses/{id}`             |
| StudentRecordController | storeByType  | `StoreStudentRecordRequest`  | `POST /records/type/{type}`     |
| StudentRecordController | updateByType | `UpdateStudentRecordRequest` | `PUT /records/type/{type}/{id}` |

## Validation Rules Summary

### Student ID Format

- Uppercase letters, numbers, hyphens only
- Example: `2024-001`, `CS-2024-123`

### Phone Number Format (Philippine)

- Must start with 0
- Followed by 10 digits
- Example: `09171234567`

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character: @$!%\*?&
- Example: `SecurePass123!`

### Strong Names (First, Middle, Last)

- Letters and spaces only
- Cannot contain numbers or special characters
- Examples: `John Doe`, `Maria Santos`

### File Upload Rules

- Maximum 10MB per file
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF
- Maximum 5 files per request

## Authorization Levels

| Request                    | Role Required | Authenticated |
| -------------------------- | ------------- | ------------- |
| RegisterRequest            | None          | No            |
| LoginRequest               | None          | No            |
| StoreStudentRequest        | Admin/Staff   | Yes           |
| UpdateStudentRequest       | Admin/Staff   | Yes           |
| StoreUserRequest           | Admin Only    | Yes           |
| UpdateUserRequest          | Admin Only    | Yes           |
| StoreCourseRequest         | Admin/Staff   | Yes           |
| UpdateCourseRequest        | Admin/Staff   | Yes           |
| StoreStudentRecordRequest  | Admin/Staff   | Yes           |
| UpdateStudentRecordRequest | Admin/Staff   | Yes           |

## Common Error Responses

### 422 - Validation Failed

```json
{
    "message": "Validation failed",
    "errors": {
        "email": ["This email address is already registered."],
        "password": ["Password must be at least 8 characters."]
    }
}
```

### 403 - Unauthorized (Insufficient Role)

```json
{
    "message": "This action is unauthorized."
}
```

### 401 - Unauthenticated

```json
{
    "message": "Unauthenticated"
}
```

## Unique Constraints

Fields with `unique` constraint check against database:

- `users.email`
- `users.username`
- `students.email`
- `students.student_id`
- `courses.code`

When updating (except creating), use `unique_except_self`:

- Example: `'email' => 'unique:users,email,' . $user->id`

## Optional vs Required

### Always Required (when creating)

- firstname, lastname
- email, password (except update)
- student_id, course code

### Optional Fields

- middlename
- age, birthdate
- address
- contact_number, gender
- course, year_level
- department, description

### Update Methods

- All student/user/course fields become optional with `sometimes` modifier
- Password is nullable (only update if provided)
- Files in record updates are optional

## Usage Examples

### From Frontend (JavaScript/Axios)

```javascript
// Register
axios.post("/register", {
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "SecurePass123!",
    password_confirmation: "SecurePass123!",
});

// Create Student
axios.post("/students", {
    student_id: "2024-001",
    firstname: "Maria",
    lastname: "Santos",
    email: "maria@example.com",
});

// Upload Records (multipart/form-data)
const formData = new FormData();
formData.append("student_id", 1);
formData.append("files", fileInput.files[0]);
axios.post("/records/type/transcript", formData);
```

### From cURL

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@example.com","password":"SecurePass123!","password_confirmation":"SecurePass123!"}'

# Create Student
curl -X POST http://localhost:8000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id":"2024-001","firstname":"Maria","lastname":"Santos","email":"maria@example.com"}'
```

## File Structure

```
backend/
├── app/Http/Requests/
│   ├── RegisterRequest.php
│   ├── LoginRequest.php
│   ├── StoreStudentRequest.php
│   ├── UpdateStudentRequest.php
│   ├── StoreUserRequest.php
│   ├── UpdateUserRequest.php
│   ├── StoreCourseRequest.php
│   ├── UpdateCourseRequest.php
│   ├── StoreStudentRecordRequest.php
│   └── UpdateStudentRecordRequest.php
├── app/Http/Controllers/
│   ├── AuthenticateController.php (refactored)
│   ├── StudentController.php (refactored)
│   ├── UserController.php (refactored)
│   ├── CourseController.php (refactored)
│   └── StudentRecordController.php (refactored)
├── VALIDATION.md (detailed documentation)
└── VALIDATION_QUICK_REFERENCE.md (this file)
```

---

**For detailed documentation, see [VALIDATION.md](./VALIDATION.md)**
