// ============================================================================
// FILE: backend/services/tokenService.js
// Token Service - Business logic for token management and generation
// ============================================================================

import Token from '../models/Token.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import PrintTemplate from '../models/PrintTemplate.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import QRCode from 'qrcode';

class TokenService {
  /**
   * Get all tokens with filtering
   */
  async getAllTokens(filters = {}) {
    const { customer_id, project_id, status, date_from, date_to, search, page = 1, limit = 50 } = filters;

    const where = {};

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (project_id) {
      where.project_id = project_id;
    }

    if (status) {
      where.status = status;
    }

    if (date_from && date_to) {
      where.token_date = {
        [Op.between]: [new Date(date_from), new Date(date_to)]
      };
    } else if (date_from) {
      where.token_date = {
        [Op.gte]: new Date(date_from)
      };
    } else if (date_to) {
      where.token_date = {
        [Op.lte]: new Date(date_to)
      };
    }

    if (search) {
      where[Op.or] = [
        { token_id: { [Op.iLike]: `%${search}%` } },
        { customer_name: { [Op.iLike]: `%${search}%` } },
        { vehicle_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Token.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['token_date', 'DESC']]
    });

    return {
      tokens: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get token by ID
   */
  async getTokenById(id) {
    const token = await Token.findByPk(id, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' },
        { model: PrintTemplate, as: 'template' }
      ]
    });

    if (!token) {
      throw new Error('Token not found');
    }

    return token;
  }

  /**
   * Generate QR code for token
   */
  async generateQRCode(tokenData) {
    try {
      // Create QR code data (can be JSON or simple string)
      const qrData = JSON.stringify({
        token_id: tokenData.token_id,
        order_id: tokenData.order_id || null,
        customer: tokenData.customer_name,
        timestamp: new Date().toISOString()
      });

      // Generate QR code as base64 data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 200,
        margin: 1
      });

      return {
        qr_code_data: qrData,
        qr_code_url: qrCodeDataURL
      };
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Create new token
   */
  async createToken(tokenData, userId) {
    const token_id = `TKN-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Sanitize integer fields - convert empty strings to null
    const sanitizedData = { ...tokenData };
    ['order_id', 'customer_id', 'project_id', 'template_id'].forEach(field => {
      if (sanitizedData[field] === '' || sanitizedData[field] === undefined) {
        sanitizedData[field] = null;
      }
    });

    // Fetch related data for snapshots
    let customerName = sanitizedData.customer_name;
    let projectName = sanitizedData.project_name;

    if (sanitizedData.customer_id && !customerName) {
      const customer = await Customer.findByPk(sanitizedData.customer_id);
      customerName = customer?.name;
    }

    if (sanitizedData.project_id && !projectName) {
      const project = await Project.findByPk(sanitizedData.project_id);
      projectName = project?.name;
    }

    // Generate QR code
    const qrCodeData = await this.generateQRCode({
      token_id,
      order_id: sanitizedData.order_id,
      customer_name: customerName
    });

    const token = await Token.create({
      token_id,
      ...sanitizedData,
      customer_name: customerName,
      project_name: projectName,
      qr_code_data: qrCodeData.qr_code_data,
      qr_code_url: qrCodeData.qr_code_url,
      created_by_user_id: userId,
      sync_status: 'SYNCED'
    });

    return token;
  }

  /**
   * Update token
   */
  async updateToken(id, tokenData, userId) {
    const token = await this.getTokenById(id);

    // If order_id or customer changed, regenerate QR code
    if (tokenData.order_id || tokenData.customer_name) {
      const qrCodeData = await this.generateQRCode({
        token_id: token.token_id,
        order_id: tokenData.order_id || token.order_id,
        customer_name: tokenData.customer_name || token.customer_name
      });

      tokenData.qr_code_data = qrCodeData.qr_code_data;
      tokenData.qr_code_url = qrCodeData.qr_code_url;
    }

    await token.update({
      ...tokenData,
      sync_status: 'SYNCED'
    });

    return token;
  }

  /**
   * Delete token
   */
  async deleteToken(id) {
    const token = await this.getTokenById(id);

    // Don't delete if token has been used
    if (token.status === 'USED') {
      throw new Error('Cannot delete used token. Please cancel it instead.');
    }

    await token.destroy();
    return { success: true, message: 'Token deleted successfully' };
  }

  /**
   * Update token status
   */
  async updateTokenStatus(id, status) {
    const token = await this.getTokenById(id);

    const validStatuses = ['ACTIVE', 'USED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    await token.update({ status });

    return token;
  }

  /**
   * Record token print
   */
  async recordPrint(id, userId) {
    const token = await this.getTokenById(id);

    await token.update({
      print_count: token.print_count + 1,
      last_printed_at: new Date(),
      printed_by_user_id: userId
    });

    return token;
  }

  /**
   * Get tokens by order
   */
  async getTokensByOrder(orderId) {
    const tokens = await Token.findAll({
      where: { order_id: orderId },
      order: [['token_date', 'DESC']]
    });

    return tokens;
  }

  /**
   * Generate token from order
   */
  async generateFromOrder(orderId, additionalData, userId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const tokenData = {
      order_id: orderId,
      customer_id: order.customer_id,
      project_id: order.project_id,
      customer_name: order.customer?.name,
      project_name: order.project?.name,
      delivery_address: additionalData.delivery_address || order.delivery_address,
      vehicle_number: additionalData.vehicle_number,
      vehicle_type: additionalData.vehicle_type,
      driver_name: additionalData.driver_name,
      driver_phone: additionalData.driver_phone,
      notes: additionalData.notes,
      template_id: additionalData.template_id
    };

    return await this.createToken(tokenData, userId);
  }
}

export default new TokenService();
