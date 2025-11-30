import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const validatePassword = (password) => {
  // Check if password exists and is a string
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // At least 8 characters
  if (password.length < 8) {
    return false;
  }
  
  // Check for at least one uppercase letter (A-Z)
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Check for at least one lowercase letter (a-z)
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Check for at least one number (0-9)
  if (!/[0-9]/.test(password)) {
    return false;
  }
  
  // All checks passed
  return true;
};

