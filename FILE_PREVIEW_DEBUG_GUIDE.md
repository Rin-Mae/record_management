# File Preview/Download - Debugging Guide

## Summary of Changes Made

### Backend Changes

1. **Updated `getPendingVerification()` method** in `StudentRecordController.php`:
   - Added explicit file column selection
   - Added `withoutTrashed()` to ensure deleted files are excluded
   - Files now explicitly loaded: `id`, `student_record_id`, `file_path`, `file_name`, `file_type`, `file_size`, `created_at`

### Frontend Changes

1. **Enhanced `PendingVerification.jsx` component**:
   - Added detailed console logging at API fetch time
   - Shows API response structure
   - Logs individual record and file details
   - Added fallback warning message if no files are found
   - Added debug panel (bottom right) showing file count in development mode

2. **Improved file preview modal**:
   - Added image load error handler with logging
   - Added PDF load error handler with logging
   - Improved button styling and spacing
   - Added file size display in modal header

3. **Download function enhancements**:
   - Using modern `createElement('a')` approach for file downloads
   - Better error handling and logging
   - Proper download attribute support

## How to Debug

### Step 1: Open Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Ensure no JavaScript errors are showing

### Step 2: Check Pending Verification Page

1. Navigate to **Admin > Pending Verification**
2. You should see records in the table

### Step 3: Look at Console Logs

When the page loads, you'll see console logs:

```
API Response: {...}
Success: true
Data count: 4
First record: {...}
First record files: [...]
First file: {id: 1, file_path: "student_records/2/...", ...}
```

### Step 4: Analyze the Output

- **If `Data count: 0`**: No records found - check database
- **If `First record files: []`**: Records found but no files - check database files
- **If `First record files: [{...}]`**: Files are being returned correctly

### Step 5: Open Verification Modal

1. Click "Verify" button on a record
2. Check if files list is visible
3. If "No files found" warning appears, files aren't being returned

### Step 6: Test File Preview/Download

1. Click eye icon (view) on a file
2. The preview modal should open
3. If image/PDF, it should display or show error message
4. Click download button to download file

## Expected Behavior

### If Everything Works:

1. Records table shows pending records with file count
2. Clicking verify shows modal with files list
3. Files display with name and size
4. Clicking view opens preview or download option
5. Download button works correctly

### If Files Don't Show:

1. Check console for error messages
2. Look for "No files found" warning in modal
3. Check Network tab - API request/response
4. Verify file data structure matches expected format

## Verification Workflow Test

```
1. Create a test record:
   - Go to My Records (Student)
   - Upload a birth certificate PDF
   - Note the record ID

2. Check admin view:
   - Go to Pending Verification
   - Search for your uploaded record
   - Click Verify
   - See the files list
   - Try to view/download

3. If files don't show:
   - Check browser console for errors
   - Check Network tab for API response
   - Verify database has record_files entries
```

## File Storage Locations

- **Physical files**: `backend/storage/app/public/student_records/[user_id]/`
- **Web accessible**: `/storage/student_records/[user_id]/[filename]`
- **Frontend URL**: `/storage/${file.file_path}`

## Common Issues &amp; Solutions

### Issue: "No files found" warning

**Solution**:

- Check database: `SELECT * FROM record_files WHERE student_record_id = X;`
- Verify file storage directory exists
- Check file permissions

### Issue: Files show but don't preview

**Solution**:

- Check browser console for image/PDF load errors
- Verify file exists in storage directory
- Try direct URL in browser: `/storage/student_records/2/[filename]`

### Issue: Download button doesn't work

**Solution**:

- Check console for errors
- Verify file_path is correctly set in database
- Try clicking download link in console: `fetch('/storage/...')`

## Support Information

- Backend API: `/records/pending-verification` (GET)
- Response format: `{success: true, data: [...], pagination: {...}}`
- Each record includes: `id`, `user`, `record_type`, `files` array
- Each file includes: `id`, `file_path`, `file_name`, `file_size`, `file_type`
