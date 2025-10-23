// ============================================================================
// FILE: backend/middleware/authorize.js
// Permission-based authorization middleware
// ============================================================================

/**
 * Check if user has required permission
 * @param {string} permission - Required permission (e.g., 'template:view')
 * @returns {function} Express middleware
 */
export const checkPermission = (permission) => {
  return (req, res, next) => {
    // If user is not authenticated, this should not be reached (authenticateToken should catch it)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin has all permissions
    if (req.user.role === 'ADMIN' || (req.user.permissions && req.user.permissions.includes('*'))) {
      return next();
    }

    // Check if user has the specific permission
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    // Permission denied
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  };
};

/**
 * Check if user has any of the required roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {function} Express middleware
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Insufficient role permissions'
    });
  };
};

// Alias for backwards compatibility
export const authorize = checkRole;

export default { checkPermission, checkRole, authorize };
