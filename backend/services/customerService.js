import Customer from '../models/Customer.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class CustomerService {
  // Create new customer
  async createCustomer(customerData, userId) {
    const { name, address, phone, email, customer_type, balance } = customerData;

    // Generate unique customer ID
    const customer_id = `CUST-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const customer = await Customer.create({
      customer_id,
      name,
      address,
      phone,
      email,
      customer_type: customer_type || 'regular',
      balance: balance || 0,
      created_by_user_id: userId,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return customer;
  }

  // Get customer by ID
  async getCustomerById(id) {
    const customer = await Customer.findByPk(id, {
      include: ['creator', 'orders', 'payments']
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  // Get all customers
  async getAllCustomers(filters = {}) {
    const { search, customer_type, page = 1, limit = 20 } = filters;

    const where = {};

    if (customer_type) {
      where.customer_type = customer_type;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { customer_id: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Customer.findAndCountAll({
      where,
      include: ['creator'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      customers: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  // Update customer
  async updateCustomer(id, customerData) {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      throw new Error('Customer not found');
    }

    await customer.update({
      ...customerData,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return customer;
  }

  // Delete customer
  async deleteCustomer(id) {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      throw new Error('Customer not found');
    }

    await customer.destroy();

    return { message: 'Customer deleted successfully' };
  }

  // Update customer balance
  async updateBalance(id, amount, operation = 'add') {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      throw new Error('Customer not found');
    }

    const currentBalance = parseFloat(customer.balance);
    const newBalance = operation === 'add'
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    await customer.update({
      balance: newBalance,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return customer;
  }

  // Get customer orders
  async getCustomerOrders(customerId) {
    const customer = await Customer.findByPk(customerId, {
      include: ['orders']
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer.orders;
  }

  // Get customer payments
  async getCustomerPayments(customerId) {
    const customer = await Customer.findByPk(customerId, {
      include: ['payments']
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer.payments;
  }
}

export default new CustomerService();
