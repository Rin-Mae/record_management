/**
 * Special characters validation patterns
 */
export const SPECIAL_CHARS_PATTERN = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g;
const ALLOWED_SPECIAL_CHARS = ['-', '_', '.', '@']; // Only for email @, names can have - or .

/**
 * Validate if a string contains disallowed special characters
 * @param {string} value - The value to validate
 * @param {array} allowedChars - Additional characters to allow (optional)
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateSpecialCharacters = (value, allowedChars = []) => {
  if (!value || typeof value !== 'string') {
    return { isValid: true, message: '' };
  }

  const allowed = new Set([...ALLOWED_SPECIAL_CHARS, ...allowedChars]);
  const hasInvalidChars = value.split('').some((char) => {
    if (SPECIAL_CHARS_PATTERN.test(char) && !allowed.has(char)) {
      return true;
    }
    return false;
  });

  if (hasInvalidChars) {
    return {
      isValid: false,
      message: `Special characters are not allowed (except: ${[...allowed].join(', ')})`,
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate name (no special characters except - and .)
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, message: 'Name must be less than 100 characters' };
  }

  return validateSpecialCharacters(name, ['-', '.', ' ']);
};

/**
 * Validate student ID (alphanumeric with - allowed)
 * @param {string} studentId - Student ID to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateStudentId = (studentId) => {
  if (!studentId || studentId.trim().length === 0) {
    return { isValid: false, message: 'Student ID is required' };
  }

  if (studentId.length < 2) {
    return { isValid: false, message: 'Student ID must be at least 2 characters' };
  }

  if (studentId.length > 50) {
    return { isValid: false, message: 'Student ID must be less than 50 characters' };
  }

  return validateSpecialCharacters(studentId, ['-']);
};

/**
 * Validate course name (no special characters except - and .)
 * @param {string} courseName - Course name to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateCourseName = (courseName) => {
  if (!courseName || courseName.trim().length === 0) {
    return { isValid: false, message: 'Course name is required' };
  }

  if (courseName.length < 3) {
    return { isValid: false, message: 'Course name must be at least 3 characters' };
  }

  if (courseName.length > 100) {
    return { isValid: false, message: 'Course name must be less than 100 characters' };
  }

  return validateSpecialCharacters(courseName, ['-', '.', ' ', '&', '(', ')']);
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }

  return { isValid: true, message: '' };
};
