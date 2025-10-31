// ============================================================================
// FILE: backend/services/searchService.js
// Global Search Service - Search across all entities
// ============================================================================

import { Op } from 'sequelize';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import Check from '../models/Check.js';
import Token from '../models/Token.js';
import User from '../models/User.js';

class SearchService {
  /**
   * Global search across all entities
   */
  async globalSearch(query, filters = {}) {
    const {
      entities = ['customers', 'orders', 'projects', 'payments', 'checks', 'tokens'],
      startDate,
      endDate,
      minAmount,
      maxAmount,
      status,
      limit = 50
    } = filters;

    const results = {
      customers: [],
      orders: [],
      projects: [],
      payments: [],
      checks: [],
      tokens: [],
      summary: {
        totalResults: 0,
        searchQuery: query
      }
    };

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateFilter.created_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.created_at = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Search Customers
    if (entities.includes('customers') && query) {
      try {
        const customers = await Customer.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${query}%` } },
              { phone: { [Op.iLike]: `%${query}%` } },
              { email: { [Op.iLike]: `%${query}%` } },
              { customer_id: { [Op.iLike]: `%${query}%` } }
            ],
            ...dateFilter
          },
          limit: parseInt(limit),
          order: [['created_at', 'DESC']]
        });
        results.customers = customers.map(c => ({
          ...c.toJSON(),
          entityType: 'customer'
        }));
        results.summary.totalResults += customers.length;
      } catch (err) {
        console.error('Error searching customers:', err);
      }
    }

    // Search Orders
    if (entities.includes('orders')) {
      try {
        const whereClause = { ...dateFilter };
        if (query) {
          whereClause[Op.or] = [
            { order_id: { [Op.iLike]: `%${query}%` } },
            { delivery_address: { [Op.iLike]: `%${query}%` } }
          ];
        }
        if (status) {
          whereClause.status = status;
        }
        if (minAmount || maxAmount) {
          whereClause.final_amount = {};
          if (minAmount) whereClause.final_amount[Op.gte] = parseFloat(minAmount);
          if (maxAmount) whereClause.final_amount[Op.lte] = parseFloat(maxAmount);
        }

        const orders = await Order.findAll({
          where: whereClause,
          include: [
            { model: Customer, as: 'customer' },
            { model: Project, as: 'project' }
          ],
          limit: parseInt(limit),
          order: [['created_at', 'DESC']]
        });
        results.orders = orders.map(o => ({
          ...o.toJSON(),
          entityType: 'order'
        }));
        results.summary.totalResults += orders.length;
      } catch (err) {
        console.error('Error searching orders:', err);
      }
    }

    // Search Projects
    if (entities.includes('projects') && query) {
      try {
        const whereClause = {
          [Op.or]: [
            { project_id: { [Op.iLike]: `%${query}%` } },
            { project_name: { [Op.iLike]: `%${query}%` } }
          ],
          ...dateFilter
        };
        if (status) {
          whereClause.status = status;
        }

        const projects = await Project.findAll({
          where: whereClause,
          include: [{ model: Customer, as: 'customer' }],
          limit: parseInt(limit),
          order: [['created_at', 'DESC']]
        });
        results.projects = projects.map(p => ({
          ...p.toJSON(),
          entityType: 'project'
        }));
        results.summary.totalResults += projects.length;
      } catch (err) {
        console.error('Error searching projects:', err);
      }
    }

    // Search Payments
    if (entities.includes('payments')) {
      try {
        const whereClause = { ...dateFilter };
        if (query) {
          whereClause[Op.or] = [
            { payment_id: { [Op.iLike]: `%${query}%` } },
            { notes: { [Op.iLike]: `%${query}%` } }
          ];
        }
        if (minAmount || maxAmount) {
          whereClause.amount = {};
          if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
          if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
        }

        const payments = await Payment.findAll({
          where: whereClause,
          include: [
            { model: Customer, as: 'customer' },
            { model: Order, as: 'order' },
            { model: Project, as: 'project' }
          ],
          limit: parseInt(limit),
          order: [['created_at', 'DESC']]
        });
        results.payments = payments.map(p => ({
          ...p.toJSON(),
          entityType: 'payment'
        }));
        results.summary.totalResults += payments.length;
      } catch (err) {
        console.error('Error searching payments:', err);
      }
    }

    // Search Checks
    if (entities.includes('checks')) {
      try {
        const whereClause = { ...dateFilter };
        if (query) {
          whereClause[Op.or] = [
            { check_id: { [Op.iLike]: `%${query}%` } },
            { check_number: { [Op.iLike]: `%${query}%` } },
            { bank_name: { [Op.iLike]: `%${query}%` } }
          ];
        }
        if (status) {
          whereClause.status = status;
        }
        if (minAmount || maxAmount) {
          whereClause.amount = {};
          if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
          if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
        }

        const checks = await Check.findAll({
          where: whereClause,
          include: [
            { model: Customer, as: 'customer' },
            { model: Payment, as: 'payment' }
          ],
          limit: parseInt(limit),
          order: [['created_at', 'DESC']]
        });
        results.checks = checks.map(c => ({
          ...c.toJSON(),
          entityType: 'check'
        }));
        results.summary.totalResults += checks.length;
      } catch (err) {
        console.error('Error searching checks:', err);
      }
    }

    // Search Tokens
    if (entities.includes('tokens') && query) {
      try {
        const whereClause = {
          [Op.or]: [
            { token_id: { [Op.iLike]: `%${query}%` } },
            { vehicle_number: { [Op.iLike]: `%${query}%` } },
            { driver_name: { [Op.iLike]: `%${query}%` } },
            { customer_name: { [Op.iLike]: `%${query}%` } }
          ],
          ...dateFilter
        };
        if (status) {
          whereClause.status = status;
        }

        const tokens = await Token.findAll({
          where: whereClause,
          include: [
            { model: Order, as: 'order' },
            { model: Customer, as: 'customer' }
          ],
          limit: parseInt(limit),
          order: [['created_at', 'DESC']]
        });
        results.tokens = tokens.map(t => ({
          ...t.toJSON(),
          entityType: 'token'
        }));
        results.summary.totalResults += tokens.length;
      } catch (err) {
        console.error('Error searching tokens:', err);
      }
    }

    return results;
  }

  /**
   * Get quick filter presets (Today, This Week, This Month)
   */
  getQuickFilters() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of this week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // End of today
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    return {
      today: {
        startDate: today.toISOString(),
        endDate: endOfToday.toISOString(),
        label: 'Today'
      },
      thisWeek: {
        startDate: startOfWeek.toISOString(),
        endDate: endOfToday.toISOString(),
        label: 'This Week'
      },
      thisMonth: {
        startDate: startOfMonth.toISOString(),
        endDate: endOfToday.toISOString(),
        label: 'This Month'
      }
    };
  }
}

export default new SearchService();
