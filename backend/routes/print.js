// ============================================================================
// FILE: backend/routes/print.js
// Print API Routes - Generate print data for various documents
// ============================================================================

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/authorize.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import printService from '../services/printService.js';

const router = express.Router();

/**
 * GET /api/print/settings
 * Get user's print settings
 */
router.get('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const settings = await printService.getUserPrintSettings(req.user.id);
  res.json({ success: true, data: settings });
}));

/**
 * PUT /api/print/settings
 * Update user's print settings
 */
router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const settings = await printService.updateUserPrintSettings(req.user.id, req.body);
  res.json({ success: true, data: settings, message: 'Print settings updated successfully' });
}));

/**
 * POST /api/print/token/:tokenId
 * Generate token print data
 */
router.post('/token/:tokenId', authenticateToken, checkPermission('token:print'), asyncHandler(async (req, res) => {
  const { template_id } = req.body;
  const printData = await printService.generateTokenPrint(
    req.params.tokenId,
    template_id,
    req.user.id
  );
  res.json({ success: true, data: printData });
}));

/**
 * POST /api/print/invoice/:orderId
 * Generate invoice print data
 */
router.post('/invoice/:orderId', authenticateToken, checkPermission('invoice:print'), asyncHandler(async (req, res) => {
  const { template_id } = req.body;
  const printData = await printService.generateInvoicePrint(
    req.params.orderId,
    template_id,
    req.user.id
  );
  res.json({ success: true, data: printData });
}));

/**
 * POST /api/print/receipt/:paymentId
 * Generate receipt print data
 */
router.post('/receipt/:paymentId', authenticateToken, checkPermission('receipt:print'), asyncHandler(async (req, res) => {
  const { template_id } = req.body;
  const printData = await printService.generateReceiptPrint(
    req.params.paymentId,
    template_id,
    req.user.id
  );
  res.json({ success: true, data: printData });
}));

/**
 * POST /api/print/preview
 * Generate template preview with sample data
 */
router.post('/preview', authenticateToken, asyncHandler(async (req, res) => {
  const { html_content, css_content, type } = req.body;

  // Sample data based on type
  const sampleData = {
    TOKEN: {
      token_id: 'TKN-PREVIEW-001',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer_name: 'Sample Customer Ltd',
      project_name: 'Sample Project Site',
      vehicle_number: 'ABC-1234',
      vehicle_type: 'Truck',
      driver_name: 'John Doe',
      driver_phone: '+92-300-1234567',
      delivery_address: '123 Main Street, Karachi, Pakistan',
      notes: 'This is a preview with sample data',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      company_name: 'Timber Mart',
      company_address: '456 Business Ave, Karachi',
      company_phone: '+92-21-1234567',
      company_email: 'info@timbermart.com'
    },
    INVOICE: {
      invoice_number: 'INV-PREVIEW-001',
      order_id: 'ORD-PREVIEW-001',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer_name: 'Sample Customer Ltd',
      customer_address: '789 Customer Street, Karachi',
      customer_phone: '+92-300-7654321',
      items_table: '<tr><td>1</td><td>Sample Item</td><td>10 PCS</td><td>₨1,000</td><td>0%</td><td>₨10,000</td></tr>',
      subtotal: '₨10,000.00',
      discount: '₨500.00',
      total: '₨9,500.00',
      paid: '₨5,000.00',
      balance: '₨4,500.00',
      payment_status: 'PARTIAL',
      company_name: 'Timber Mart',
      company_address: '456 Business Ave, Karachi',
      company_phone: '+92-21-1234567',
      company_email: 'info@timbermart.com'
    },
    RECEIPT: {
      receipt_number: 'RCP-PREVIEW-001',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer_name: 'Sample Customer Ltd',
      amount: '₨5,000.00',
      amount_in_words: 'Five Thousand Rupees Only',
      payment_method: 'Cash',
      payment_type: 'Order Payment',
      received_by: 'Admin User',
      company_name: 'Timber Mart',
      company_address: '456 Business Ave, Karachi',
      company_phone: '+92-21-1234567',
      company_email: 'info@timbermart.com'
    },
    VOUCHER: {
      voucher_number: 'VCH-PREVIEW-001',
      date: new Date().toLocaleDateString(),
      customer_name: 'Sample Customer Ltd',
      amount: '₨3,000.00',
      amount_in_words: 'Three Thousand Rupees Only',
      payment_type: 'Advance Payment',
      signature_line: '________________________',
      company_name: 'Timber Mart',
      company_address: '456 Business Ave, Karachi',
      company_phone: '+92-21-1234567',
      company_email: 'info@timbermart.com'
    },
    CUSTOM: {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      company_name: 'Timber Mart',
      company_address: '456 Business Ave, Karachi',
      company_phone: '+92-21-1234567',
      company_email: 'info@timbermart.com'
    }
  };

  const data = sampleData[type] || sampleData.CUSTOM;

  // Replace placeholders
  let processedHTML = html_content;
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    const value = data[key] !== null && data[key] !== undefined ? data[key] : '';
    processedHTML = processedHTML.replace(placeholder, value);
  });

  res.json({
    success: true,
    data: {
      html: processedHTML,
      css: css_content,
      type
    }
  });
}));

export default router;
