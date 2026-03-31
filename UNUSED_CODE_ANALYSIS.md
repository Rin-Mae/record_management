# Unused Code Analysis Report

## Record Management System 2.0

**Date:** April 2026  
**Scope:** Complete backend (Laravel) and frontend (React) analysis

---

## BACKEND (Laravel) - UNUSED CODE

### 1. **Student Model - COMPLETELY UNUSED** ✗ Safe to Delete

**Location:** `backend/app/Models/Student.php`

**Status:** The entire Student model is redundant and should be removed.

**Reasoning:**

- The application uses the `User` model as the primary Student entity
- No controllers or services ever instantiate or directly use the Student model
- All student-related operations are performed through `User::verifiedStudents()` scope
- Database has both `students` and `users` tables, but only `users` is actively used

**Methods in this model that are UNUSED:**

- `user()` - relationship (never called)
- `records()` - method (never called)
- `scopeSearch()` - never invoked
- `scopeByCourse()` - never invoked
- `scopeByYearLevel()` - never invoked

**Impact if removed:**

- ✅ SAFE - No breaking changes
- No code imports or uses this model
- Migration creates the table but it's empty
- Storage space is wasted

**Recommendation:** DELETE this model entirely.

---

### 2. **StudentObserver - NEVER TRIGGERED** ✗ Safe to Delete

**Location:** `backend/app/Observers/StudentObserver.php`

**Status:** Observer is registered but never triggered because Student model is never used.

**Current registration:** `backend/app/Providers/AppServiceProvider.php` (line 34)

```php
Student::observe(StudentObserver::class);
```

**Methods defined (but never triggered):**

- `created()` - logs Student creation
- `updated()` - logs Student update
- `updated()` - logs Student deletion
- `deleted()` - logs Student deletion

**Why it's unused:**

- Since no code creates/updates the Student model, observer events never fire
- Activity logging for students should happen through User model events (UserObserver) instead

**Impact if removed:**

- ✅ SAFE - Zero impact because Student model events are never triggered
- Cleanup of unnecessary Artisan observable code

**Recommendation:** DELETE this observer and remove the registration from AppServiceProvider.

---

### 3. **RecordTypeController::getActive() METHOD** ⚠️ Check Usage

**Location:** `backend/app/Http/Controllers/RecordTypeController.php` (line ~30)

**Endpoint:** `GET /record-types/active` (registered in routes)

**Current Implementation:**

```php
public function getActive()
{
    $recordTypes = RecordType::orderBy('name')
        ->get(['id', 'name']);
    return response()->json($recordTypes);
}
```

**Status:** Method exists but appears UNUSED in frontend

- ✅ Exported via API routes
- ❌ No frontend component imports or calls this endpoint
- Alternative: `RecordType::all()` could be used if needed

**Recommendation:**

- Search frontend for any usage of `/record-types/active` endpoint
- If truly unused, either keep as "available API" or delete

---

### 4. **StudentRecord Model Constants** ⚠️ Partial Usage

**Location:** `backend/app/Models/StudentRecord.php` (lines ~20-35)

**Unused Constants:**

```php
public const RECORD_TYPES = [
    'birth-certificate' => 'Birth Certificate',
    'marriage-certificate' => 'Marriage Certificate',
    'tor' => 'Transcript of Records',
    'comprehensive-exam' => 'Comprehensive Exam',
];

public const SIMPLIFIED_TYPES = [
    'birth-certificate', 'marriage-certificate', 'tor', 'comprehensive-exam',
];
```

**Status:**

- Constants are defined but NEVER REFERENCED in code
- Record types come from database `RecordType` table instead
- `isSimplifiedType()` method exists but never called

**Recommendation:**

- Keep for documentation purposes, but mark as deprecated
- Or remove if you're confident all types are handled by database

---

### 5. **StudentController::statistics() METHOD** ✓ Currently Used

**Location:** `backend/app/Http/Controllers/StudentController.php` (line ~145)

**Endpoint:** `GET /students/statistics`

**Status:** ✓ USED - Called by AdminDashboard.jsx

- Confirmed in routes
- Used for dashboard statistics display

**No changes needed.**

---

## FRONTEND (React) - UNUSED CODE

### 1. **EnrollmentListServices.jsx - MISSING FILE** ✗ Import Error

**Location:** Missing from `frontend/src/services/`

**What's Wrong:**

```jsx
// frontend/src/components/admin/CourseStudents.jsx (line 6)
import EnrollmentListServices from "../../services/EnrollmentListServices.jsx";
```

This file doesn't exist but is imported in CourseStudents.jsx

**Called At:** Line 124 in CourseStudents.jsx

```jsx
const response = await EnrollmentListServices.getEnrollmentLists({...})
```

**Business Logic:** Appears to fetch enrollment lists (likely for a feature that was removed)

**Current Impact:** ⚠️ This will cause a runtime error if CourseStudents tries to use this method

**Recommendation:**

- **Option A:** Delete the import and the line calling it (if feature not needed)
- **Option B:** Create the missing service file with stub methods
- Check git history to see what this was for

---

### 2. **api.js - DUPLICATE/UNUSED FILE** ✗ Safe to Delete

**Location:** `frontend/src/services/api.js`

**Status:** This file is completely unused; `api.jsx` is the active one

**Proof of unused status:**

- All 6 service files import from `api.jsx`:
  - `AuthServices.jsx` ✓ imports api.jsx
  - `CourseServices.jsx` ✓ imports api.jsx
  - `StudentServices.jsx` ✓ imports api.jsx
  - `StudentRecordServices.jsx` ✓ imports api.jsx
  - `UserServices.jsx` ✓ imports api.jsx
  - `Register.jsx` ✓ imports api.jsx

- NO files import `api.js`

**Why it exists:**

- Both `api.js` and `api.jsx` are similar axios clients
- Likely created during refactoring, might be older version
- They're probably duplicates with same functionality

**Recommendation:** DELETE `api.js` - move all logic to `api.jsx` if needed.

---

### 3. **Validation Functions - UNUSED EXPORTS** ⚠️ Partial Usage

**Location:** `frontend/src/utils/validation.js`

#### A. `validateFileSize()` - ✗ UNUSED

```javascript
export const validateFileSize = (fileSizeInBytes, maxSizeInMB = 10) => {
  // ... implementation
};
```

- **Status:** Exported but never imported or called anywhere
- **Could be used for:** File upload validation in UploadRecord.jsx, MyRecords.jsx
- **Recommendation:** DELETE if not needed, OR implement file size validation if required

#### B. `validateFileType()` - ✗ UNUSED

```javascript
export const validateFileType = (
  fileName,
  allowedExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
    "gif",
  ],
) => {
  // ... implementation
};
```

- **Status:** Exported but never imported or called anywhere
- **Implementation:** Checks file extensions
- **Recommendation:** DELETE if validation is handled backend-side only

#### C. Utility Constants - ✗ UNUSED

```javascript
export const SPECIAL_CHARS_PATTERN = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g;
export const ALLOWED_SPECIAL_CHARS = ["-", "_", ".", "@"];
```

- **Status:** Exported but only `SPECIAL_CHARS_PATTERN` is used internally by `validateSpecialCharacters()`
- **ALLOWED_SPECIAL_CHARS:** Not used anywhere (could be inlined)
- **Recommendation:** Keep `SPECIAL_CHARS_PATTERN` as it's used; consider making `ALLOWED_SPECIAL_CHARS` private

---

### 4. **Utility Functions - USAGE SUMMARY** ✓ Mostly Used

#### Used Validation Functions:

- ✓ `validateEmail()` - Used in Login.jsx
- ✓ `validatePassword()` - Used in Login.jsx and useUsers.jsx
- ✓ `validateSpecialCharacters()` - Used in Students.jsx, Courses.jsx, etc.
- ✓ `validateName()` - Used in Register.jsx, useStudents.jsx
- ✓ `validateStudentId()` - Used in useStudents.jsx
- ✓ `validateCourseName()` - Used in Courses.jsx

#### Used Utility Functions:

- ✓ `getGenderDisplay()` - Used in Students.jsx
- ✓ `formatDate()` - Used in ActivityLogs.jsx, PendingVerification.jsx
- ✓ `getRoleBadge()` - Used in useUsers.jsx, Users.jsx
- ✓ `initialStudentForm` - Used in CourseStudents.jsx, useStudents.jsx
- ✓ `initialUserForm` - Used in useUsers.jsx

---

### 5. **Service Files - USAGE SUMMARY** ✓ All Used

All service files are properly imported and used:

- ✓ `AuthServices.jsx` - Used in AuthContext.jsx
- ✓ `CourseServices.jsx` - Used in CoursesContext.jsx, Courses.jsx, useStudents.jsx
- ✓ `StudentServices.jsx` - Used in AdminDashboard.jsx, useStudents.jsx, CourseStudents.jsx
- ✓ `StudentRecordServices.jsx` - Used in RecordManagement.jsx, MyRecords.jsx, UploadRecord.jsx
- ✓ `UserServices.jsx` - Used in Register.jsx, VerifyEmail.jsx, StudentVerification.jsx

---

## SUMMARY TABLE

| Category | Item                             | Status        | Severity    | Action           |
| -------- | -------------------------------- | ------------- | ----------- | ---------------- |
| Backend  | Student Model                    | Unused        | 🔴 CRITICAL | DELETE           |
| Backend  | StudentObserver                  | Unused        | 🔴 CRITICAL | DELETE           |
| Backend  | RecordTypeController.getActive() | Likely Unused | 🟡 MEDIUM   | Check/Delete     |
| Backend  | StudentRecord Constants          | Unused        | 🟡 MEDIUM   | Delete/Document  |
| Frontend | api.js                           | Unused        | 🔴 CRITICAL | DELETE           |
| Frontend | EnrollmentListServices import    | Missing File  | 🔴 CRITICAL | Fix Import       |
| Frontend | validateFileSize()               | Unused        | 🟡 MEDIUM   | Delete/Implement |
| Frontend | validateFileType()               | Unused        | 🟡 MEDIUM   | Delete/Implement |
| Frontend | Validation Constants             | Partial       | 🟢 LOW      | Refactor         |

---

## RECOMMENDED CLEANUP ACTIONS

### Priority 1 - CRITICAL (Do First)

1. ✂️ Delete `backend/app/Models/Student.php`
2. ✂️ Delete `backend/app/Observers/StudentObserver.php`
3. ✂️ Remove Student observer registration from `AppServiceProvider.php`
4. ✂️ Delete `frontend/src/services/api.js`
5. 🔧 Fix missing `EnrollmentListServices.jsx` (create or remove import)

### Priority 2 - MEDIUM (Review After Priority 1)

1. 📋 Check if `RecordTypeController::getActive()` is used
2. 📋 Review StudentRecord model constants - keep or delete?
3. ✂️ Delete unused validation functions or implement their usage
4. 🔧 Clean up validation.js exports

### Priority 3 - LOW (Nice to Have)

1. 📝 Add comments to document why certain exports exist
2. 🧹 Consider consolidating utility files
3. 📊 Run Code Coverage metrics on tests

---

## VERIFICATION CHECKLIST

Before deleting items, verify:

- [ ] Run full test suite
- [ ] Check git history for why items were created
- [ ] Search entire codebase one more time for hidden references
- [ ] Test all admin and student workflows
- [ ] Check database - no orphaned tables needed by these models
- [ ] Verify no environment-specific code depends on these files

---

## NOTES

**About the Student Model:**
The application has two separate tables (`students` and `users`) but only uses the `users` table to store student accounts. The `students` table appears to be legacy code. This is a significant architectural debt that should be cleaned up.

**About ValidationFunctions:**
The validation functions were likely implemented in anticipation of frontend-side validation but backend currently handles most validation. Consider a validation strategy review - some frontend validation would improve UX.

**About EnrollmentListServices:**
The import of this missing service suggests an "Enrollment List" feature was planned or removed. Check commit history to understand the context.
