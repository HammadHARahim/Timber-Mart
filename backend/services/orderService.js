import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Customer from '../models/Customer.js';
import Item from '../models/Item.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

class OrderService {
  // Create new order with items
  async createOrder(orderData, userId) {
    const transaction = await sequelize.transaction();

    try {
      const { customer_id, project_id, delivery_date, delivery_address, notes, items } = orderData;

      // Validate customer exists
      const customer = await Customer.findByPk(customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Validate project if provided
      if (project_id) {
        const project = await Project.findByPk(project_id);
        if (!project) {
          throw new Error('Project not found');
        }
      }

      // Validate items
      if (!items || items.length === 0) {
        throw new Error('Order must have at least one item');
      }

      // Generate unique order ID
      const order_id = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // Calculate order totals
      let total_amount = 0;
      let discount_amount = 0;

      const orderItems = [];

      for (const itemData of items) {
        // Get item details
        const item = await Item.findByPk(itemData.item_id);
        if (!item) {
          throw new Error(`Item not found: ${itemData.item_id}`);
        }

        const quantity = parseFloat(itemData.quantity);
        const unit_price = parseFloat(itemData.unit_price || item.default_price);
        const discount_percent = parseFloat(itemData.discount_percent || 0);

        const total_price = quantity * unit_price;
        const item_discount = (total_price * discount_percent) / 100;
        const final_amount = total_price - item_discount;

        total_amount += total_price;
        discount_amount += item_discount;

        orderItems.push({
          item_id: item.id,
          item_name: item.name,
          item_name_urdu: item.name_urdu,
          quantity,
          unit: item.unit,
          unit_price,
          total_price,
          discount_percent,
          discount_amount: item_discount,
          final_amount,
          notes: itemData.notes
        });
      }

      const final_amount = total_amount - discount_amount;

      // Create order
      const order = await Order.create({
        order_id,
        customer_id,
        project_id,
        order_date: new Date(),
        total_amount,
        discount_amount,
        final_amount,
        paid_amount: 0,
        balance_amount: final_amount,
        status: 'PENDING',
        payment_status: 'UNPAID',
        delivery_date,
        delivery_address,
        notes,
        created_by_user_id: userId,
        updated_by_user_id: userId,
        sync_status: 'SYNCED',
        last_synced_at: new Date()
      }, { transaction });

      // Create order items
      for (const itemData of orderItems) {
        await OrderItem.create({
          order_id: order.id,
          ...itemData
        }, { transaction });
      }

      await transaction.commit();

      // Fetch complete order with associations
      const completeOrder = await this.getOrderById(order.id);

      return completeOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get order by ID with full details
  async getOrderById(id) {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customer_id', 'name', 'phone', 'email', 'address']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'project_id', 'project_name', 'status']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'item_id', 'name', 'name_urdu', 'category']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'full_name']
        }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Get all orders with filtering
  async getAllOrders(filters = {}) {
    const {
      search,
      customer_id,
      project_id,
      status,
      payment_status,
      date_from,
      date_to,
      page = 1,
      limit = 20
    } = filters;

    const where = {};

    // Filter by customer
    if (customer_id) {
      where.customer_id = customer_id;
    }

    // Filter by project
    if (project_id) {
      where.project_id = project_id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by payment status
    if (payment_status) {
      where.payment_status = payment_status;
    }

    // Filter by date range
    if (date_from || date_to) {
      where.order_date = {};
      if (date_from) {
        where.order_date[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        where.order_date[Op.lte] = new Date(date_to);
      }
    }

    // Search by order ID
    if (search) {
      where[Op.or] = [
        { order_id: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customer_id', 'name', 'phone']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'project_id', 'project_name']
        },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'item_name', 'quantity', 'unit', 'final_amount']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['order_date', 'DESC']]
    });

    return {
      orders: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  // Update order
  async updateOrder(id, orderData, userId) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id);

      if (!order) {
        throw new Error('Order not found');
      }

      const { customer_id, project_id, delivery_date, delivery_address, notes, items } = orderData;

      // If items are being updated, recalculate totals
      if (items && items.length > 0) {
        // Delete existing order items
        await OrderItem.destroy({
          where: { order_id: id },
          transaction
        });

        // Recalculate totals
        let total_amount = 0;
        let discount_amount = 0;

        for (const itemData of items) {
          const item = await Item.findByPk(itemData.item_id);
          if (!item) {
            throw new Error(`Item not found: ${itemData.item_id}`);
          }

          const quantity = parseFloat(itemData.quantity);
          const unit_price = parseFloat(itemData.unit_price || item.default_price);
          const discount_percent = parseFloat(itemData.discount_percent || 0);

          const total_price = quantity * unit_price;
          const item_discount = (total_price * discount_percent) / 100;
          const final_amount = total_price - item_discount;

          total_amount += total_price;
          discount_amount += item_discount;

          await OrderItem.create({
            order_id: id,
            item_id: item.id,
            item_name: item.name,
            item_name_urdu: item.name_urdu,
            quantity,
            unit: item.unit,
            unit_price,
            total_price,
            discount_percent,
            discount_amount: item_discount,
            final_amount,
            notes: itemData.notes
          }, { transaction });
        }

        const final_amount = total_amount - discount_amount;
        const balance_amount = final_amount - order.paid_amount;

        // Update order totals
        await order.update({
          customer_id: customer_id || order.customer_id,
          project_id: project_id !== undefined ? project_id : order.project_id,
          delivery_date: delivery_date || order.delivery_date,
          delivery_address: delivery_address || order.delivery_address,
          notes: notes !== undefined ? notes : order.notes,
          total_amount,
          discount_amount,
          final_amount,
          balance_amount,
          updated_by_user_id: userId,
          sync_status: 'SYNCED',
          last_synced_at: new Date()
        }, { transaction });
      } else {
        // Update order without changing items
        await order.update({
          customer_id: customer_id || order.customer_id,
          project_id: project_id !== undefined ? project_id : order.project_id,
          delivery_date: delivery_date || order.delivery_date,
          delivery_address: delivery_address || order.delivery_address,
          notes: notes !== undefined ? notes : order.notes,
          updated_by_user_id: userId,
          sync_status: 'SYNCED',
          last_synced_at: new Date()
        }, { transaction });
      }

      await transaction.commit();

      // Fetch updated order
      const updatedOrder = await this.getOrderById(id);

      return updatedOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(id, status, userId) {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('Order not found');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    await order.update({
      status,
      updated_by_user_id: userId,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return order;
  }

  // Delete order
  async deleteOrder(id) {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order has payments
    const paymentCount = await order.countPayments();

    if (paymentCount > 0) {
      throw new Error('Cannot delete order with associated payments');
    }

    // OrderItems will be cascade deleted
    await order.destroy();

    return { message: 'Order deleted successfully' };
  }

  // Get order summary/statistics
  async getOrderStatistics(filters = {}) {
    const { customer_id, project_id, date_from, date_to } = filters;

    const where = {};

    if (customer_id) where.customer_id = customer_id;
    if (project_id) where.project_id = project_id;

    if (date_from || date_to) {
      where.order_date = {};
      if (date_from) where.order_date[Op.gte] = new Date(date_from);
      if (date_to) where.order_date[Op.lte] = new Date(date_to);
    }

    const stats = await Order.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'total_value'],
        [sequelize.fn('SUM', sequelize.col('paid_amount')), 'total_paid'],
        [sequelize.fn('SUM', sequelize.col('balance_amount')), 'total_balance'],
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    return stats;
  }
}

export default new OrderService();
