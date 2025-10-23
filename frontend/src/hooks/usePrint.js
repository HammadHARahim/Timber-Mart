// ============================================================================
// FILE: src/hooks/usePrint.js
// Custom hook for print operations
// ============================================================================

import { useState, useCallback } from 'react';
import printService from '../services/printService';

const usePrint = () => {
  const [printData, setPrintData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate print data for a token
   */
  const generateTokenPrint = useCallback(async (tokenId, templateId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printService.generateTokenPrint(tokenId, templateId);
      setPrintData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate token print';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate print data for an invoice
   */
  const generateInvoicePrint = useCallback(async (orderId, templateId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printService.generateInvoicePrint(orderId, templateId);
      setPrintData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate invoice print';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate print data for a receipt
   */
  const generateReceiptPrint = useCallback(async (paymentId, templateId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printService.generateReceiptPrint(paymentId, templateId);
      setPrintData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate receipt print';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Preview template with sample data
   */
  const previewTemplate = useCallback(async (htmlContent, cssContent, type) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printService.previewTemplate(htmlContent, cssContent, type);
      setPrintData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate preview';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Trigger browser print dialog
   */
  const triggerPrint = useCallback((data = null) => {
    try {
      const dataToPrint = data || printData;
      if (!dataToPrint) {
        throw new Error('No print data available');
      }
      printService.triggerPrint(dataToPrint);
    } catch (err) {
      const errorMessage = err.message || 'Failed to trigger print';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [printData]);

  /**
   * Download print data as PDF
   */
  const downloadAsPDF = useCallback((data = null, filename = 'document.pdf') => {
    try {
      const dataToPrint = data || printData;
      if (!dataToPrint) {
        throw new Error('No print data available');
      }
      printService.downloadAsPDF(dataToPrint, filename);
    } catch (err) {
      const errorMessage = err.message || 'Failed to download PDF';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [printData]);

  /**
   * Get preview HTML
   */
  const getPreviewHTML = useCallback((data = null) => {
    try {
      const dataToPrint = data || printData;
      if (!dataToPrint) {
        throw new Error('No print data available');
      }
      return printService.getPreviewHTML(dataToPrint);
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate preview HTML';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [printData]);

  /**
   * Clear print data
   */
  const clearPrintData = useCallback(() => {
    setPrintData(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    printData,
    loading,
    error,
    generateTokenPrint,
    generateInvoicePrint,
    generateReceiptPrint,
    previewTemplate,
    triggerPrint,
    downloadAsPDF,
    getPreviewHTML,
    clearPrintData,
    clearError
  };
};

export default usePrint;
