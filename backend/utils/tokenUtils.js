import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    permissions: user.permissions || []
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' // 15 minutes
  });
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Get refresh token expiry date
 */
export const getRefreshTokenExpiry = () => {
  const days = parseInt(process.env.REFRESH_TOKEN_DAYS) || 7;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
