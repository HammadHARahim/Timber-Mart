// ============================================================================
// FILE: backend/services/checkService.js
// Check Service - Business logic for check tracking
// ============================================================================

import Check from '../models/Check.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class CheckService {
  /**
   * Get all checks with filtering
   */
  async getAllChecks(filters = {}) {
    const {
      customer_id,
      project_id,
      payment_id,
      status,
      payee_type,
      date_from,
      date_to,
      search,
      page = 1,
      limit = 50
    } = filters;

    const where = {};

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (project_id) {
      where.project_id = project_id;
    }

    if (payment_id) {
      where.payment_id = payment_id;
    }

    if (status) {
      where.status = status;
    }

    if (payee_type) {
      where.payee_type = payee_type;
    }

    if (date_from && date_to) {
      where.check_date = {
        [Op.between]: [new Date(date_from), new Date(date_to)]
      };
    } else if (date_from) {
      where.check_date = {
        [Op.gte]: new Date(date_from)
      };
    } else if (date_to) {
      where.check_date = {
        [Op.lte]: new Date(date_to)
      };
    }

    if (search) {
      where[Op.or] = [
        { check_id: { [Op.iLike]: `%${search}%` } },
        { check_number: { [Op.iLike]: `%${search}%` } },
        { payee_name: { [Op.iLike]: `%${search}%` } },
        { bank_name: { [Op.iLike]: `%${search}%` } },
        { '$customer.name$': { [Op.iLike]: `%${search}%` } },
        { '$project.project_name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Check.findAndCountAll({
      where,
      include: [
        { model: Payment, as: 'payment' },
        { model: Customer, as: 'customer', required: false },
        { model: Project, as: 'project', required: false },
        { model: User, as: 'creator' },
        { model: User, as: 'clearer' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['check_date', 'DESC']],
      subQuery: false,
      distinct: true
    });

    return {
      checks: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get check by ID
   */
  async getCheckById(id) {
    const check = await Check.findByPk(id, {
      include: [
        { model: Payment, as: 'payment' },
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' },
        { model: User, as: 'creator' },
        { model: User, as: 'clearer' }
      ]
    });

    if (!check) {
      throw new Error('Check not found');
    }

    return check;
  }

  /**
   * Create new check
   */
  async createCheck(checkData, userId) {
    const check_id = `CHK-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Sanitize integer fields
    const sanitizedData = { ...checkData };
    ['payment_id', 'customer_id', 'project_id'].forEach(field => {
      if (sanitizedData[field] === '' || sanitizedData[field] === undefined) {
        sanitizedData[field] = null;
      }
    });

    const check = await Check.create({
      check_id,
      ...sanitizedData,
      created_by_user_id: userId,
      sync_status: 'SYNCED'
    });

    return check;
  }

  /**
   * Update check
   */
  async updateCheck(id, checkData, userId) {
    const check = await this.getCheckById(id);

    await check.update({
      ...checkData,
      sync_status: 'SYNCED'
    });

    return check;
  }

  /**
   * Delete check
   */
  async deleteCheck(id) {
    const check = await this.getCheckById(id);

    // Don't delete if check is cleared
    if (check.status === 'CLEARED') {
      throw new Error('Cannot delete cleared check. Please mark it as cancelled first.');
    }

    await check.destroy();
    return { success: true, message: 'Check deleted successfully' };
  }

  /**
   * Mark check as cleared
   */
  async markAsCleared(id, userId) {
    const check = await this.getCheckById(id);

    if (check.status === 'CLEARED') {
      throw new Error('Check is already marked as cleared');
    }

    await check.update({
      status: 'CLEARED',
      cleared_date: new Date(),
      cleared_by_user_id: userId
    });

    // Update related payment status if exists
    // When check is cleared, automatically approve and complete the payment
    if (check.payment_id) {
      const payment = await Payment.findByPk(check.payment_id);
      if (payment && payment.status === 'PENDING') {
        await payment.update({
          status: 'APPROVED',
          approved_at: new Date(),
          approved_by_user_id: userId
        });
      }
    }

    return check;
  }

  /**
   * Mark check as bounced
   */
  async markAsBounced(id, userId) {
    const check = await this.getCheckById(id);

    if (check.status === 'BOUNCED') {
      throw new Error('Check is already marked as bounced');
    }

    await check.update({
      status: 'BOUNCED',
      cleared_by_user_id: userId
    });

    // Update related payment status if exists
    if (check.payment_id) {
      const payment = await Payment.findByPk(check.payment_id);
      if (payment && (payment.status === 'APPROVED' || payment.status === 'COMPLETED')) {
        // Revert payment back to pending if check bounced
        await payment.update({
          status: 'PENDING',
          approved_at: null,
          approved_by_user_id: null
        });
      }
    }

    return check;
  }

  /**
   * Cancel check
   */
  async cancelCheck(id) {
    const check = await this.getCheckById(id);

    if (check.status === 'CLEARED') {
      throw new Error('Cannot cancel a cleared check');
    }

    await check.update({
      status: 'CANCELLED'
    });

    return check;
  }

  /**
   * Get pending checks
   */
  async getPendingChecks() {
    const checks = await Check.findAll({
      where: { status: 'PENDING' },
      include: [
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' },
        { model: Payment, as: 'payment' }
      ],
      order: [['check_date', 'ASC']]
    });

    return checks;
  }

  /**
   * Get overdue checks (pending checks past their check_date)
   */
  async getOverdueChecks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checks = await Check.findAll({
      where: {
        status: 'PENDING',
        check_date: {
          [Op.lt]: today
        }
      },
      include: [
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' },
        { model: Payment, as: 'payment' }
      ],
      order: [['check_date', 'ASC']]
    });

    return checks;
  }

  /**
   * Get checks by customer
   */
  async getChecksByCustomer(customerId) {
    const checks = await Check.findAll({
      where: { customer_id: customerId },
      include: [
        { model: Payment, as: 'payment' },
        { model: Project, as: 'project' }
      ],
      order: [['check_date', 'DESC']]
    });

    return checks;
  }

  /**
   * Get checks by project
   */
  async getChecksByProject(projectId) {
    const checks = await Check.findAll({
      where: { project_id: projectId },
      include: [
        { model: Customer, as: 'customer' },
        { model: Payment, as: 'payment' }
      ],
      order: [['check_date', 'DESC']]
    });

    return checks;
  }

  /**
   * Get checks by payment
   */
  async getChecksByPayment(paymentId) {
    const checks = await Check.findAll({
      where: { payment_id: paymentId },
      order: [['check_date', 'DESC']]
    });

    return checks;
  }

  /**
   * Get check statistics
   */
  async getCheckStatistics() {
    const totalPending = await Check.count({ where: { status: 'PENDING' } });
    const totalCleared = await Check.count({ where: { status: 'CLEARED' } });
    const totalBounced = await Check.count({ where: { status: 'BOUNCED' } });
    const totalCancelled = await Check.count({ where: { status: 'CANCELLED' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = await Check.count({
      where: {
        status: 'PENDING',
        check_date: { [Op.lt]: today }
      }
    });

    // Calculate total amounts
    const pendingChecks = await Check.findAll({
      where: { status: 'PENDING' },
      attributes: ['amount']
    });
    const totalPendingAmount = pendingChecks.reduce((sum, check) => sum + parseFloat(check.amount), 0);

    return {
      total: totalPending + totalCleared + totalBounced + totalCancelled,
      pending: totalPending,
      cleared: totalCleared,
      bounced: totalBounced,
      cancelled: totalCancelled,
      overdue: overdueCount,
      totalPendingAmount
    };
  }
}

export default new CheckService();
