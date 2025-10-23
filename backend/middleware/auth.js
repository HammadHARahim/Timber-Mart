import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};

// ============================================================================
// FILE: backend/middleware/auth.js (UPDATE)
// ============================================================================
// Add authorize middleware

export function authorize(requiredPermissions = []) {
  return async (req, res, next) => {
    try {
      // For now, simple role-based check
      const permissionMap = {
        ADMIN: ['*'],
        MANAGER: ['customer.view', 'customer.create', 'customer.edit'],
        SALES_OFFICER: ['customer.view', 'customer.create', 'customer.edit'],
        WAREHOUSE_STAFF: ['customer.view'],
        ACCOUNTANT: []
      };

      const userPermissions = permissionMap[req.user.role] || [];

      // Admin has all permissions
      if (userPermissions.includes('*')) {
        return next();
      }

      // Check if user has required permission
      const hasPermission = requiredPermissions.some(perm =>
        userPermissions.includes(perm)
      );

      if (!hasPermission && requiredPermissions.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to perform this action'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export {
  authenticateToken,
  optionalAuth
};
