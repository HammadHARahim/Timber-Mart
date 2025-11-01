// ============================================================================
// FILE: backend/services/projectService.js
// Project Service - Business logic for project management
// ============================================================================

import Project from '../models/Project.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class ProjectService {
  /**
   * Get all projects with filtering
   */
  async getAllProjects(filters = {}) {
    const { customer_id, status, search, page = 1, limit = 50 } = filters;

    const where = {};

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { project_id: { [Op.iLike]: `%${search}%` } },
        { project_name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { '$customer.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer', required: false },
        { model: User, as: 'creator' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      subQuery: false,
      distinct: true
    });

    return {
      projects: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get project by ID with related data
   */
  async getProjectById(id) {
    const project = await Project.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'creator' },
        {
          model: Order,
          as: 'orders',
          include: [{ model: Customer, as: 'customer' }]
        }
      ]
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  /**
   * Create new project
   */
  async createProject(projectData, userId) {
    const project_id = `PRJ-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const project = await Project.create({
      project_id,
      ...projectData,
      created_by_user_id: userId,
      balance: projectData.estimated_amount || 0,
      sync_status: 'SYNCED'
    });

    return project;
  }

  /**
   * Update project
   */
  async updateProject(id, projectData) {
    const project = await this.getProjectById(id);

    await project.update({
      ...projectData,
      sync_status: 'SYNCED'
    });

    return project;
  }

  /**
   * Delete project
   */
  async deleteProject(id) {
    const project = await this.getProjectById(id);

    // Check if project has orders
    const orderCount = await Order.count({ where: { project_id: id } });
    if (orderCount > 0) {
      throw new Error('Cannot delete project with linked orders. Please remove orders first.');
    }

    await project.destroy();
    return { success: true, message: 'Project deleted successfully' };
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics(projectId) {
    const project = await this.getProjectById(projectId);

    // Get order statistics
    const orders = await Order.findAll({
      where: { project_id: projectId }
    });

    const totalOrders = orders.length;
    const totalOrderAmount = orders.reduce((sum, order) =>
      sum + parseFloat(order.final_amount || 0), 0
    );

    // Get payment statistics
    const payments = await Payment.findAll({
      where: { project_id: projectId }
    });

    const totalPayments = payments.reduce((sum, payment) =>
      sum + parseFloat(payment.amount || 0), 0
    );

    return {
      project,
      statistics: {
        totalOrders,
        totalOrderAmount,
        totalPayments,
        currentBalance: parseFloat(project.balance || 0),
        estimatedAmount: parseFloat(project.estimated_amount || 0),
        actualAmount: parseFloat(project.actual_amount || 0)
      }
    };
  }

  /**
   * Get revenue report by project
   */
  async getRevenueReport(filters = {}) {
    const { start_date, end_date } = filters;

    const where = {};

    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const projects = await Project.findAll({
      where,
      include: [
        { model: Customer, as: 'customer' },
        { model: Order, as: 'orders' }
      ],
      order: [['created_at', 'DESC']]
    });

    const report = projects.map(project => {
      const orders = project.orders || [];
      const totalRevenue = orders.reduce((sum, order) =>
        sum + parseFloat(order.final_amount || 0), 0
      );

      return {
        project_id: project.project_id,
        project_name: project.project_name,
        customer_name: project.customer?.name || 'N/A',
        status: project.status,
        estimated_amount: parseFloat(project.estimated_amount || 0),
        actual_amount: parseFloat(project.actual_amount || 0),
        total_revenue: totalRevenue,
        order_count: orders.length,
        balance: parseFloat(project.balance || 0)
      };
    });

    return report;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'IN_PROGRESS' } });
    const completedProjects = await Project.count({ where: { status: 'COMPLETED' } });

    // Calculate total revenue from all projects
    const projects = await Project.findAll({
      include: [{ model: Order, as: 'orders' }]
    });

    const totalRevenue = projects.reduce((sum, project) => {
      const projectRevenue = (project.orders || []).reduce((orderSum, order) =>
        orderSum + parseFloat(order.final_amount || 0), 0
      );
      return sum + projectRevenue;
    }, 0);

    // Get total payments
    const payments = await Payment.findAll();
    const totalPayments = payments.reduce((sum, payment) =>
      sum + parseFloat(payment.amount || 0), 0
    );

    // Get total orders
    const totalOrders = await Order.count();

    // Get total customers
    const totalCustomers = await Customer.count();

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      totalPayments,
      totalOrders,
      totalCustomers
    };
  }
}

export default new ProjectService();
