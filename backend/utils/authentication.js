import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// ============================================================================
// 4. AUTHENTICATION UTILITIES
// ============================================================================

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} Whether password matches
 */
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/**
 * Generate JWT token
 * @param {object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  } catch (error) {
    return null;
  }
}