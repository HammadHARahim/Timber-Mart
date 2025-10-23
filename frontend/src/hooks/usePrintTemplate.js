// ============================================================================
// FILE: src/hooks/usePrintTemplate.js
// Custom hook for print template management
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import printTemplateService from '../services/printTemplateService';

const usePrintTemplate = (templateId = null) => {
  const [template, setTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  /**
   * Fetch a single template by ID
   */
  const fetchTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.getTemplateById(id);
      setTemplate(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all templates with filters
   */
  const fetchTemplates = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.getAllTemplates(filters);
      setTemplates(response.data.templates);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load templates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get default template for a type
   */
  const fetchDefaultTemplate = useCallback(async (type) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.getDefaultTemplate(type);
      setTemplate(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load default template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get placeholders for a template type
   */
  const fetchPlaceholders = useCallback(async (type) => {
    try {
      const response = await printTemplateService.getPlaceholders(type);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load placeholders';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Create a new template
   */
  const createTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.createTemplate(templateData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(async (id, templateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.updateTemplate(id, templateData);
      setTemplate(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.deleteTemplate(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set template as default
   */
  const setAsDefault = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.setAsDefault(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to set default template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplicate a template
   */
  const duplicateTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await printTemplateService.duplicateTemplate(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to duplicate template';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch template on mount if templateId is provided
  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId, fetchTemplate]);

  return {
    template,
    templates,
    loading,
    error,
    pagination,
    fetchTemplate,
    fetchTemplates,
    fetchDefaultTemplate,
    fetchPlaceholders,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setAsDefault,
    duplicateTemplate,
    clearError
  };
};

export default usePrintTemplate;
