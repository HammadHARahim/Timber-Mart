// ============================================================================
// TIMBER MART CRM - BACKEND SETUP
// ============================================================================
// This file sets up the Express server, PostgreSQL connection, and initializes
// the database schema. It's the entry point for the entire backend.
// ============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============================================================================
// 0. IMPORTS FUNCTION LEVEL
// ============================================================================
import { sequelize, testConnection as testDatabaseConnection } from './config/database.js';
import { config } from './config/env.js';
import logger from './config/logger.js';
import customerRoutes from './routes/customers.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import orderRoutes from './routes/orders.js';
import itemRoutes from './routes/items.js';
import printTemplateRoutes from './routes/printTemplates.js';
import tokenRoutes from './routes/tokens.js';
import printRoutes from './routes/print.js';
import paymentRoutes from './routes/payments.js';
import checkRoutes from './routes/checks.js';
import projectRoutes from './routes/projects.js';
import searchRoutes from './routes/search.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';
import requestLogger from './middleware/requestLogger.js';
import { apiLimiter, authLimiter, syncLimiter } from './middleware/rateLimiter.js';
import { validateLogin } from './middleware/validation.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, getRefreshTokenExpiry } from './utils/tokenUtils.js';
import { seedRolesAndPermissions, getPermissionsForRole } from './utils/seedData.js';
import User from './models/User.js';
import { setupAssociations } from './models/associations.js';

// Load environment variables
dotenv.config();

// ============================================================================
// 1. EXPRESS SERVER SETUP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// ============================================================================
// 6. ROUTES
// ============================================================================

/**
 * AUTHENTICATION ROUTES
 * Based on requirements: Phase 1 - Authentication
 */

// LOGIN ENDPOINT
// POST /api/auth/login
app.post('/api/auth/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password'
    });
  }

  // Check if user is active
  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      error: 'User account is inactive'
    });
  }

  // Compare password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password'
    });
  }

  // Get permissions for role
  const permissions = getPermissionsForRole(user.role);

  // Generate access and refresh tokens
  const accessToken = generateAccessToken({ ...user.dataValues, permissions });
  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry();

  // Update user with refresh token and last login
  await user.update({
    last_login: new Date(),
    refresh_token: refreshToken,
    refresh_token_expires: refreshTokenExpiry
  });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      permissions
    }
  });
}));

// REFRESH TOKEN ENDPOINT
// POST /api/auth/refresh
app.post('/api/auth/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  // Find user with this refresh token
  const user = await User.findOne({ where: { refresh_token: refreshToken } });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }

  // Check if refresh token is expired
  if (new Date() > user.refresh_token_expires) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token expired'
    });
  }

  // Generate new access token
  const permissions = getPermissionsForRole(user.role);
  const accessToken = generateAccessToken({ ...user.dataValues, permissions });

  res.json({
    success: true,
    accessToken,
    expiresIn: 900 // 15 minutes
  });
}));

// LOGOUT ENDPOINT
// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Clear refresh token
  await User.update(
    { refresh_token: null, refresh_token_expires: null },
    { where: { id: req.user.id } }
  );

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// CREATE USER ENDPOINT (Admin only)
// POST /api/auth/users
app.post('/api/auth/users', authenticateToken, asyncHandler(async (req, res) => {
  // Only ADMIN can create users
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can create users'
    });
  }

  const { username, email, full_name, password, role, department } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // Check if username already exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Username already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    username,
    email,
    full_name,
    password_hash,
    role: role || 'SALES_OFFICER',
    department,
    is_active: true,
    created_by_user_id: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      department: newUser.department
    }
  });
}));

// GET ALL USERS (Admin only)
// GET /api/auth/users
app.get('/api/auth/users', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can view all users'
    });
  }

  const users = await User.findAll({
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']]
  });

  res.json({
    success: true,
    users
  });
}));

// UPDATE USER (Admin only)
// PUT /api/auth/users/:id
app.put('/api/auth/users/:id', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can update users'
    });
  }

  const { id } = req.params;
  const { email, full_name, role, department, is_active, password } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const updateData = { email, full_name, role, department, is_active };

  // If password is being updated, hash it
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password_hash = await bcrypt.hash(password, salt);
  }

  await user.update(updateData);

  res.json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      is_active: user.is_active
    }
  });
}));

// GET CURRENT USER
// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const permissions = getPermissionsForRole(user.role);

  res.json({
    success: true,
    user: {
      ...user.toJSON(),
      permissions
    }
  });
}));

// Mount route modules
app.use('/api/customers', customerRoutes);
app.use('/api/sync', syncLimiter, syncRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/print-templates', printTemplateRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/print', printRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checks', checkRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);

// HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ERROR HANDLING
app.use(errorHandler);

// ============================================================================
// 7. SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const connected = await testDatabaseConnection();
    if (!connected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Setup model associations
    logger.info('Setting up model associations...');
    setupAssociations();
    logger.info('Model associations configured');

    // Sync database models
    logger.info('Syncing database models...');
    // Use force: false to avoid dropping tables. New tables will be created if they don't exist.
    // For schema changes, use migrations instead of alter: true
    await sequelize.sync({ force: false });
    logger.info('Database models synced');

    // Seed default roles and permissions (if needed)
    await seedRolesAndPermissions();

    // Start server - bind to 0.0.0.0 to allow network access
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Network: Server accessible on all network interfaces`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}
// Start the server
startServer();

// Export for testing
export {
  app,
  sequelize,
  User
};