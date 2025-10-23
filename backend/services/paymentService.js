// ============================================================================
// FILE: backend/services/paymentService.js
// Payment Service - Business logic for payment management
// ============================================================================

import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import amountToWords from '../utils/amountToWords.js';

class PaymentService {
  /**
   * Get all payments with filtering
   */
  async getAllPayments(filters = {}) {
    const {
      customer_id,
      project_id,
      order_id,
      payment_type,
      payment_method,
      status,
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

    if (order_id) {
      where.order_id = order_id;
    }

    if (payment_type) {
      where.payment_type = payment_type;
    }

    if (payment_method) {
      where.payment_method = payment_method;
    }

    if (status) {
      where.status = status;
    }

    if (date_from && date_to) {
      where.payment_date = {
        [Op.between]: [new Date(date_from), new Date(date_to)]
      };
    } else if (date_from) {
      where.payment_date = {
        [Op.gte]: new Date(date_from)
      };
    } else if (date_to) {
      where.payment_date = {
        [Op.lte]: new Date(date_to)
      };
    }

    if (search) {
      where[Op.or] = [
        { payment_id: { [Op.iLike]: `%${search}%` } },
        { reference_number: { [Op.iLike]: `%${search}%` } },
        { check_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer' },
        { model: Order, as: 'order' },
        { model: Project, as: 'project' },
        { model: User, as: 'creator' },
        { model: User, as: 'approver' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']]
    });

    return {
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    const payment = await Payment.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Order, as: 'order' },
        { model: Project, as: 'project' },
        { model: User, as: 'creator' },
        { model: User, as: 'approver' }
      ]
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  /**
   * Create new payment
   */
  async createPayment(paymentData, userId) {
    const payment_id = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Sanitize integer fields
    const sanitizedData = { ...paymentData };
    ['order_id', 'customer_id', 'project_id'].forEach(field => {
      if (sanitizedData[field] === '' || sanitizedData[field] === undefined) {
        sanitizedData[field] = null;
      }
    });

    // Validate that at least one entity is linked
    if (!sanitizedData.customer_id && !sanitizedData.project_id && !sanitizedData.order_id) {
      throw new Error('Payment must be linked to at least one entity (customer, project, or order)');
    }

    // If order is provided, auto-link to customer and project
    if (sanitizedData.order_id) {
      const order = await Order.findByPk(sanitizedData.order_id);
      if (order) {
        sanitizedData.customer_id = sanitizedData.customer_id || order.customer_id;
        sanitizedData.project_id = sanitizedData.project_id || order.project_id;
      }
    }

    const payment = await Payment.create({
      payment_id,
      ...sanitizedData,
      created_by_user_id: userId,
      sync_status: 'SYNCED'
    });

    // Update balances if payment is approved or auto-approved
    if (sanitizedData.status === 'APPROVED' || sanitizedData.status === 'COMPLETED') {
      await this.updateBalancesOnPayment(payment);
    }

    return payment;
  }

  /**
   * Update payment
   */
  async updatePayment(id, paymentData, userId) {
    const payment = await this.getPaymentById(id);
    const oldStatus = payment.status;

    await payment.update({
      ...paymentData,
      sync_status: 'SYNCED'
    });

    // If status changed to APPROVED or COMPLETED, update balances
    if ((oldStatus !== 'APPROVED' && oldStatus !== 'COMPLETED') &&
        (paymentData.status === 'APPROVED' || paymentData.status === 'COMPLETED')) {
      await this.updateBalancesOnPayment(payment);
    }

    return payment;
  }

  /**
   * Delete payment
   */
  async deletePayment(id) {
    const payment = await this.getPaymentById(id);

    // Don't delete if payment is approved or completed
    if (payment.status === 'APPROVED' || payment.status === 'COMPLETED') {
      throw new Error('Cannot delete approved or completed payment. Please reject or cancel it first.');
    }

    await payment.destroy();
    return { success: true, message: 'Payment deleted successfully' };
  }

  /**
   * Approve payment
   */
  async approvePayment(id, userId) {
    const payment = await this.getPaymentById(id);

    if (payment.status !== 'PENDING') {
      throw new Error('Only pending payments can be approved');
    }

    await payment.update({
      status: 'APPROVED',
      approved_by_user_id: userId,
      approved_at: new Date()
    });

    // Update balances
    await this.updateBalancesOnPayment(payment);

    return payment;
  }

  /**
   * Reject payment
   */
  async rejectPayment(id, userId) {
    const payment = await this.getPaymentById(id);

    if (payment.status !== 'PENDING') {
      throw new Error('Only pending payments can be rejected');
    }

    await payment.update({
      status: 'REJECTED',
      approved_by_user_id: userId,
      approved_at: new Date()
    });

    return payment;
  }

  /**
   * Complete payment
   */
  async completePayment(id) {
    const payment = await this.getPaymentById(id);

    if (payment.status !== 'APPROVED') {
      throw new Error('Only approved payments can be marked as completed');
    }

    await payment.update({
      status: 'COMPLETED'
    });

    return payment;
  }

  /**
   * Update customer/project balances when payment is approved
   */
  async updateBalancesOnPayment(payment) {
    const amount = parseFloat(payment.amount);
    const paymentType = payment.payment_type;

    // Update customer balance
    if (payment.customer_id) {
      const customer = await Customer.findByPk(payment.customer_id);
      if (customer) {
        let newBalance = parseFloat(customer.balance || 0);

        // LOAN increases balance (customer owes us)
        // ADVANCE/DEPOSIT decreases balance (customer paid us)
        if (paymentType === 'LOAN') {
          newBalance += amount;
        } else if (paymentType === 'ADVANCE' || paymentType === 'DEPOSIT' || paymentType === 'ORDER_PAYMENT') {
          newBalance -= amount;
        }

        await customer.update({ balance: newBalance });
      }
    }

    // Update project balance
    if (payment.project_id) {
      const project = await Project.findByPk(payment.project_id);
      if (project) {
        let newBalance = parseFloat(project.balance || 0);

        if (paymentType === 'LOAN') {
          newBalance += amount;
        } else if (paymentType === 'ADVANCE' || paymentType === 'DEPOSIT' || paymentType === 'ORDER_PAYMENT') {
          newBalance -= amount;
        }

        await project.update({ balance: newBalance });
      }
    }

    // Update order payment status
    if (payment.order_id) {
      const order = await Order.findByPk(payment.order_id);
      if (order) {
        const totalPaid = parseFloat(order.paid_amount || 0) + amount;
        const balance = parseFloat(order.final_amount || 0) - totalPaid;

        await order.update({
          paid_amount: totalPaid,
          balance_amount: balance
        });
      }
    }
  }

  /**
   * Generate payment voucher data
   */
  async generateVoucher(id) {
    const payment = await this.getPaymentById(id);

    const voucherData = {
      payment_id: payment.payment_id,
      payment_date: payment.payment_date,
      amount: payment.amount,
      amount_in_words: amountToWords(payment.amount),
      payment_type: payment.payment_type,
      payment_method: payment.payment_method,
      customer_name: payment.customer?.name || 'N/A',
      project_name: payment.project?.name || 'N/A',
      reference_number: payment.reference_number,
      description: payment.description,
      notes: payment.notes,
      bank_name: payment.bank_name,
      check_number: payment.check_number,
      check_date: payment.check_date,
      account_number: payment.account_number,
      created_by: payment.creator?.full_name || payment.creator?.username || 'N/A',
      approved_by: payment.approver?.full_name || payment.approver?.username || 'N/A',
      status: payment.status
    };

    return voucherData;
  }

  /**
   * Get payments by customer
   */
  async getPaymentsByCustomer(customerId) {
    const payments = await Payment.findAll({
      where: { customer_id: customerId },
      include: [
        { model: Order, as: 'order' },
        { model: Project, as: 'project' }
      ],
      order: [['payment_date', 'DESC']]
    });

    return payments;
  }

  /**
   * Get payments by project
   */
  async getPaymentsByProject(projectId) {
    const payments = await Payment.findAll({
      where: { project_id: projectId },
      include: [
        { model: Customer, as: 'customer' },
        { model: Order, as: 'order' }
      ],
      order: [['payment_date', 'DESC']]
    });

    return payments;
  }

  /**
   * Get payments by order
   */
  async getPaymentsByOrder(orderId) {
    const payments = await Payment.findAll({
      where: { order_id: orderId },
      order: [['payment_date', 'DESC']]
    });

    return payments;
  }
}

export default new PaymentService();
