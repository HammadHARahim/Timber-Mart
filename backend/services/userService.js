import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

class UserService {
  // Create new user
  async createUser(userData) {
    const { username, email, password, full_name, role, department } = userData;

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
      role,
      department
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return userResponse;
  }

  // Authenticate user
  async authenticateUser(username, password) {
    // Find user by username
    const user = await User.findOne({ where: { username, is_active: true } });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return {
      token,
      user: userResponse
    };
  }

  // Get user by ID
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user
  async updateUser(id, userData) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (userData.password) {
      userData.password_hash = await hashPassword(userData.password);
      delete userData.password;
    }

    await user.update(userData);

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return userResponse;
  }

  // Deactivate user
  async deactivateUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ is_active: false });

    return { message: 'User deactivated successfully' };
  }

  // Get all users
  async getAllUsers(filters = {}) {
    const { role, is_active, page = 1, limit = 20 } = filters;

    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active;

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }
}

export default new UserService();
