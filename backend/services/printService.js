// ============================================================================
// FILE: backend/services/printService.js
// Print Service - Handle template rendering and print data generation
// ============================================================================

import PrintTemplate from '../models/PrintTemplate.js';
import PrintSettings from '../models/PrintSettings.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import Token from '../models/Token.js';

class PrintService {
  /**
   * Replace placeholders in template
   */
  replacePlaceholders(template, data) {
    let result = template;

    // Replace all placeholders
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] !== null && data[key] !== undefined ? data[key] : '';
      result = result.replace(placeholder, value);
    });

    return result;
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return `₨${parseFloat(amount || 0).toFixed(2)}`;
  }

  /**
   * Get user's print settings
   */
  async getUserPrintSettings(userId) {
    let settings = await PrintSettings.findOne({
      where: { user_id: userId },
      include: [
        { model: PrintTemplate, as: 'defaultTokenTemplate' },
        { model: PrintTemplate, as: 'defaultInvoiceTemplate' },
        { model: PrintTemplate, as: 'defaultReceiptTemplate' },
        { model: PrintTemplate, as: 'defaultVoucherTemplate' }
      ]
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await PrintSettings.create({
        user_id: userId,
        sync_status: 'SYNCED'
      });
    }

    return settings;
  }

  /**
   * Generate token print data
   */
  async generateTokenPrint(tokenId, templateId = null, userId) {
    const token = await Token.findByPk(tokenId, {
      include: [
        { model: Order, as: 'order' },
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' }
      ]
    });

    if (!token) {
      throw new Error('Token not found');
    }

    // Get template
    let template;
    if (templateId) {
      template = await PrintTemplate.findByPk(templateId);
    } else {
      const settings = await this.getUserPrintSettings(userId);
      template = settings.defaultTokenTemplate ||
                 await PrintTemplate.findOne({ where: { type: 'TOKEN', is_default: true } });
    }

    if (!template) {
      throw new Error('No template found for token printing');
    }

    // Prepare data
    const data = {
      token_id: token.token_id,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer_name: token.customer_name || token.customer?.name || '',
      project_name: token.project_name || token.project?.name || '',
      vehicle_number: token.vehicle_number || '',
      vehicle_type: token.vehicle_type || '',
      driver_name: token.driver_name || '',
      driver_phone: token.driver_phone || '',
      delivery_address: token.delivery_address || '',
      notes: token.notes || '',
      qr_code: token.qr_code_url || '',
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_logo: ''
    };

    const htmlContent = this.replacePlaceholders(template.html_content, data);
    const cssContent = template.css_content || '';

    return {
      html: htmlContent,
      css: cssContent,
      pageSize: template.page_size,
      orientation: template.orientation,
      margins: {
        top: template.margin_top,
        bottom: template.margin_bottom,
        left: template.margin_left,
        right: template.margin_right
      }
    };
  }

  /**
   * Generate invoice print data
   */
  async generateInvoicePrint(orderId, templateId = null, userId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Project, as: 'project' },
        { model: OrderItem, as: 'items' }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get template
    let template;
    if (templateId) {
      template = await PrintTemplate.findByPk(templateId);
    } else {
      const settings = await this.getUserPrintSettings(userId);
      template = settings.defaultInvoiceTemplate ||
                 await PrintTemplate.findOne({ where: { type: 'INVOICE', is_default: true } });
    }

    if (!template) {
      throw new Error('No template found for invoice printing');
    }

    // Generate items table HTML
    const itemsTableHTML = this.generateItemsTable(order.items);

    // Prepare data
    const data = {
      invoice_number: `INV-${order.order_id}`,
      order_id: order.order_id,
      date: new Date(order.order_date).toLocaleDateString(),
      time: new Date(order.order_date).toLocaleTimeString(),
      customer_name: order.customer?.name || '',
      customer_address: order.customer?.address || '',
      customer_phone: order.customer?.phone || '',
      project_name: order.project?.name || '',
      items_table: itemsTableHTML,
      subtotal: this.formatCurrency(order.total_amount),
      discount: this.formatCurrency(order.discount_amount),
      total: this.formatCurrency(order.final_amount),
      paid: this.formatCurrency(order.paid_amount),
      balance: this.formatCurrency(order.balance_amount),
      payment_status: order.payment_status,
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_logo: ''
    };

    const htmlContent = this.replacePlaceholders(template.html_content, data);
    const cssContent = template.css_content || '';

    return {
      html: htmlContent,
      css: cssContent,
      pageSize: template.page_size,
      orientation: template.orientation,
      margins: {
        top: template.margin_top,
        bottom: template.margin_bottom,
        left: template.margin_left,
        right: template.margin_right
      }
    };
  }

  /**
   * Generate items table HTML
   */
  generateItemsTable(items) {
    if (!items || items.length === 0) {
      return '<tr><td colspan="6">No items</td></tr>';
    }

    let html = '';
    items.forEach((item, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.item_name}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${this.formatCurrency(item.unit_price)}</td>
          <td>${item.discount_percent}%</td>
          <td>${this.formatCurrency(item.final_amount)}</td>
        </tr>
      `;
    });

    return html;
  }

  /**
   * Generate receipt print data
   */
  async generateReceiptPrint(paymentId, templateId = null, userId) {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Order, as: 'order' }
      ]
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Get template
    let template;
    if (templateId) {
      template = await PrintTemplate.findByPk(templateId);
    } else {
      const settings = await this.getUserPrintSettings(userId);
      template = settings.defaultReceiptTemplate ||
                 await PrintTemplate.findOne({ where: { type: 'RECEIPT', is_default: true } });
    }

    if (!template) {
      throw new Error('No template found for receipt printing');
    }

    // Prepare data
    const data = {
      receipt_number: payment.payment_id,
      date: new Date(payment.payment_date).toLocaleDateString(),
      time: new Date(payment.payment_date).toLocaleTimeString(),
      customer_name: payment.customer?.name || '',
      amount: this.formatCurrency(payment.amount),
      amount_in_words: this.convertAmountToWords(payment.amount),
      payment_method: payment.payment_method || '',
      payment_type: payment.payment_type || '',
      received_by: '',
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_logo: ''
    };

    const htmlContent = this.replacePlaceholders(template.html_content, data);
    const cssContent = template.css_content || '';

    return {
      html: htmlContent,
      css: cssContent,
      pageSize: template.page_size,
      orientation: template.orientation,
      margins: {
        top: template.margin_top,
        bottom: template.margin_bottom,
        left: template.margin_left,
        right: template.margin_right
      }
    };
  }

  /**
   * Convert amount to words (basic implementation)
   */
  convertAmountToWords(amount) {
    // Simplified - you can implement a full conversion library
    const num = Math.floor(parseFloat(amount));
    if (num === 0) return 'Zero Rupees Only';

    // This is a placeholder - implement full number-to-words conversion
    return `${num.toLocaleString()} Rupees Only`;
  }

  /**
   * Update user print settings
   */
  async updateUserPrintSettings(userId, settingsData) {
    let settings = await PrintSettings.findOne({ where: { user_id: userId } });

    if (!settings) {
      settings = await PrintSettings.create({
        user_id: userId,
        ...settingsData,
        sync_status: 'SYNCED'
      });
    } else {
      await settings.update({
        ...settingsData,
        sync_status: 'SYNCED'
      });
    }

    return settings;
  }
}

export default new PrintService();
