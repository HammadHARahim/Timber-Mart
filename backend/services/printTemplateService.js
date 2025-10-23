// ============================================================================
// FILE: backend/services/printTemplateService.js
// Print Template Service - Business logic for template management
// ============================================================================

import PrintTemplate from '../models/PrintTemplate.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class PrintTemplateService {
  /**
   * Get all print templates with filtering
   */
  async getAllTemplates(filters = {}) {
    const { type, is_active, search, page = 1, limit = 50 } = filters;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await PrintTemplate.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    return {
      templates: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    const template = await PrintTemplate.findByPk(id);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  /**
   * Get default template for a type
   */
  async getDefaultTemplate(type) {
    const template = await PrintTemplate.findOne({
      where: {
        type,
        is_default: true,
        is_active: true
      }
    });

    return template;
  }

  /**
   * Create new print template
   */
  async createTemplate(templateData, userId) {
    const template_id = `TPL-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // If setting as default, unset other defaults of same type
    if (templateData.is_default) {
      await PrintTemplate.update(
        { is_default: false },
        { where: { type: templateData.type, is_default: true } }
      );
    }

    const template = await PrintTemplate.create({
      template_id,
      ...templateData,
      created_by_user_id: userId,
      sync_status: 'SYNCED'
    });

    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(id, templateData, userId) {
    const template = await this.getTemplateById(id);

    // If setting as default, unset other defaults of same type
    if (templateData.is_default && templateData.is_default !== template.is_default) {
      await PrintTemplate.update(
        { is_default: false },
        { where: { type: template.type, is_default: true, id: { [Op.ne]: id } } }
      );
    }

    // Increment version
    const newVersion = template.version + 1;

    await template.update({
      ...templateData,
      version: newVersion,
      updated_by_user_id: userId,
      sync_status: 'SYNCED'
    });

    return template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    const template = await this.getTemplateById(id);

    // Don't delete if it's the default template
    if (template.is_default) {
      throw new Error('Cannot delete default template. Please set another template as default first.');
    }

    await template.destroy();
    return { success: true, message: 'Template deleted successfully' };
  }

  /**
   * Set template as default
   */
  async setAsDefault(id) {
    const template = await this.getTemplateById(id);

    // Unset other defaults of same type
    await PrintTemplate.update(
      { is_default: false },
      { where: { type: template.type, is_default: true } }
    );

    await template.update({ is_default: true });

    return template;
  }

  /**
   * Duplicate template (create copy)
   */
  async duplicateTemplate(id, userId) {
    const original = await this.getTemplateById(id);

    const template_id = `TPL-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const duplicate = await PrintTemplate.create({
      template_id,
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      html_content: original.html_content,
      css_content: original.css_content,
      page_size: original.page_size,
      orientation: original.orientation,
      margin_top: original.margin_top,
      margin_bottom: original.margin_bottom,
      margin_left: original.margin_left,
      margin_right: original.margin_right,
      is_default: false,
      is_active: true,
      version: 1,
      created_by_user_id: userId,
      sync_status: 'SYNCED'
    });

    return duplicate;
  }

  /**
   * Get available placeholders for template type
   */
  getPlaceholdersForType(type) {
    const commonPlaceholders = {
      date: '{{date}}',
      time: '{{time}}',
      company_name: '{{company_name}}',
      company_address: '{{company_address}}',
      company_phone: '{{company_phone}}',
      company_email: '{{company_email}}',
      company_logo: '{{company_logo}}'
    };

    const typePlaceholders = {
      TOKEN: {
        ...commonPlaceholders,
        token_id: '{{token_id}}',
        customer_name: '{{customer_name}}',
        project_name: '{{project_name}}',
        vehicle_number: '{{vehicle_number}}',
        vehicle_type: '{{vehicle_type}}',
        driver_name: '{{driver_name}}',
        driver_phone: '{{driver_phone}}',
        delivery_address: '{{delivery_address}}',
        qr_code: '{{qr_code}}',
        notes: '{{notes}}'
      },
      INVOICE: {
        ...commonPlaceholders,
        invoice_number: '{{invoice_number}}',
        order_id: '{{order_id}}',
        customer_name: '{{customer_name}}',
        customer_address: '{{customer_address}}',
        customer_phone: '{{customer_phone}}',
        items_table: '{{items_table}}',
        subtotal: '{{subtotal}}',
        discount: '{{discount}}',
        total: '{{total}}',
        paid: '{{paid}}',
        balance: '{{balance}}',
        payment_status: '{{payment_status}}'
      },
      RECEIPT: {
        ...commonPlaceholders,
        receipt_number: '{{receipt_number}}',
        customer_name: '{{customer_name}}',
        amount: '{{amount}}',
        amount_in_words: '{{amount_in_words}}',
        payment_method: '{{payment_method}}',
        payment_type: '{{payment_type}}',
        received_by: '{{received_by}}'
      },
      VOUCHER: {
        ...commonPlaceholders,
        voucher_number: '{{voucher_number}}',
        customer_name: '{{customer_name}}',
        amount: '{{amount}}',
        amount_in_words: '{{amount_in_words}}',
        payment_type: '{{payment_type}}',
        signature_line: '{{signature_line}}'
      }
    };

    return typePlaceholders[type] || commonPlaceholders;
  }
}

export default new PrintTemplateService();
