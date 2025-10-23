// ============================================================================
// FILE: src/services/printService.js
// Print generation API service
// ============================================================================

import apiService from './apiService';

const RESOURCE = '/api/print';

/**
 * Print Service
 * Handles all API calls for print data generation
 */
const printService = {
  /**
   * Generate print data for a token
   * @param {number} tokenId - Token ID
   * @param {number} templateId - Optional template ID (uses default if not specified)
   * @returns {Promise<Object>} Print data (html, css, pageSize, orientation, margins)
   */
  async generateTokenPrint(tokenId, templateId = null) {
    const response = await apiService.post(`${RESOURCE}/token/${tokenId}`, {
      template_id: templateId
    });
    return response.data;
  },

  /**
   * Generate print data for an invoice
   * @param {number} orderId - Order ID
   * @param {number} templateId - Optional template ID (uses default if not specified)
   * @returns {Promise<Object>} Print data (html, css, pageSize, orientation, margins)
   */
  async generateInvoicePrint(orderId, templateId = null) {
    const response = await apiService.post(`${RESOURCE}/invoice/${orderId}`, {
      template_id: templateId
    });
    return response.data;
  },

  /**
   * Generate print data for a receipt
   * @param {number} paymentId - Payment ID
   * @param {number} templateId - Optional template ID (uses default if not specified)
   * @returns {Promise<Object>} Print data (html, css, pageSize, orientation, margins)
   */
  async generateReceiptPrint(paymentId, templateId = null) {
    const response = await apiService.post(`${RESOURCE}/receipt/${paymentId}`, {
      template_id: templateId
    });
    return response.data;
  },

  /**
   * Get user's print settings
   * @returns {Promise<Object>} User print settings
   */
  async getUserSettings() {
    const response = await apiService.get(`${RESOURCE}/settings`);
    return response.data;
  },

  /**
   * Update user's print settings
   * @param {Object} settings - Print settings data
   * @returns {Promise<Object>} Updated settings
   */
  async updateUserSettings(settings) {
    const response = await apiService.put(`${RESOURCE}/settings`, settings);
    return response.data;
  },

  /**
   * Preview template with sample data
   * @param {string} htmlContent - HTML template content
   * @param {string} cssContent - CSS content
   * @param {string} type - Template type (TOKEN, INVOICE, RECEIPT, VOUCHER)
   * @returns {Promise<Object>} Preview data with sample data filled
   */
  async previewTemplate(htmlContent, cssContent, type) {
    const response = await apiService.post(`${RESOURCE}/preview`, {
      html_content: htmlContent,
      css_content: cssContent,
      type: type
    });
    return response.data;
  },

  /**
   * Trigger browser print dialog
   * @param {Object} printData - Print data from generate methods
   */
  triggerPrint(printData) {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('Please allow popups for printing');
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Print</title>
          <style>
            @page {
              size: ${printData.pageSize || 'A4'} ${printData.orientation || 'portrait'};
              margin: ${printData.margins?.top || 20}mm ${printData.margins?.right || 20}mm ${printData.margins?.bottom || 20}mm ${printData.margins?.left || 20}mm;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }

            ${printData.css || ''}
          </style>
        </head>
        <body>
          ${printData.html}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  },

  /**
   * Download print data as PDF
   * @param {Object} printData - Print data from generate methods
   * @param {string} filename - Filename for download
   */
  downloadAsPDF(printData, filename = 'document.pdf') {
    // For browser's native print-to-PDF functionality
    this.triggerPrint(printData);
    // User can choose "Save as PDF" in print dialog
  },

  /**
   * Get print preview HTML
   * @param {Object} printData - Print data from generate methods
   * @returns {string} Complete HTML with styles
   */
  getPreviewHTML(printData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: #f0f0f0;
            }

            .print-preview-container {
              max-width: ${printData.pageSize === 'A4' ? '210mm' : '80mm'};
              margin: 0 auto;
              background: white;
              padding: ${printData.margins?.top || 20}mm ${printData.margins?.right || 20}mm ${printData.margins?.bottom || 20}mm ${printData.margins?.left || 20}mm;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            ${printData.css || ''}
          </style>
        </head>
        <body>
          <div class="print-preview-container">
            ${printData.html}
          </div>
        </body>
      </html>
    `;
  }
};

export default printService;
