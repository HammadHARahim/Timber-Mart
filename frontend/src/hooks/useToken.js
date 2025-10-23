// ============================================================================
// FILE: src/hooks/useToken.js
// Custom hook for token management
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import tokenService from '../services/tokenService';

const useToken = (tokenId = null) => {
  const [token, setToken] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  /**
   * Fetch a single token by ID
   */
  const fetchToken = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getTokenById(id);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch token by token_id string
   */
  const fetchTokenByTokenId = useCallback(async (tokenIdString) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getTokenByTokenId(tokenIdString);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all tokens with filters
   */
  const fetchTokens = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getAllTokens(filters);
      setTokens(response.data.tokens);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load tokens';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch tokens for a specific order
   */
  const fetchTokensByOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getTokensByOrder(orderId);
      setTokens(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load order tokens';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new token
   */
  const createToken = useCallback(async (tokenData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.createToken(tokenData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate token from an order
   */
  const generateFromOrder = useCallback(async (orderId, additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.generateFromOrder(orderId, additionalData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate token from order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing token
   */
  const updateToken = useCallback(async (id, tokenData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.updateToken(id, tokenData);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel a token
   */
  const cancelToken = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.cancelToken(id);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark token as used
   */
  const markAsUsed = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.markAsUsed(id);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark token as used';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Record a print event
   */
  const recordPrint = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.recordPrint(id);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to record print';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Regenerate QR code for a token
   */
  const regenerateQRCode = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.regenerateQRCode(id);
      setToken(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to regenerate QR code';
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

  // Auto-fetch token on mount if tokenId is provided
  useEffect(() => {
    if (tokenId) {
      fetchToken(tokenId);
    }
  }, [tokenId, fetchToken]);

  return {
    token,
    tokens,
    loading,
    error,
    pagination,
    fetchToken,
    fetchTokenByTokenId,
    fetchTokens,
    fetchTokensByOrder,
    createToken,
    generateFromOrder,
    updateToken,
    cancelToken,
    markAsUsed,
    recordPrint,
    regenerateQRCode,
    clearError
  };
};

export default useToken;
