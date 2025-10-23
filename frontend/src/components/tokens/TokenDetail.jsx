// ============================================================================
// FILE: src/components/tokens/TokenDetail.jsx
// Token detail view with QR code display
// ============================================================================

import React, { useState, useEffect } from 'react';
import tokenService from '../../services/tokenService';
import printService from '../../services/printService';
import './TokenDetail.css';

const TokenDetail = ({ tokenId, onClose, onEdit, onPrint }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tokenId) {
      fetchToken();
    }
  }, [tokenId]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tokenService.getTokenById(tokenId);
      setToken(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load token');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      // Record print event
      await tokenService.recordPrint(token.id);

      // Generate print data
      const response = await printService.generateTokenPrint(token.id);
      const printData = response.data;

      // Trigger print
      printService.triggerPrint(printData);

      // Refresh token to show updated print count
      fetchToken();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to print token');
    }
  };

  const handleCancel = async () => {
    if (!confirm(`Cancel token ${token.token_id}?`)) return;

    try {
      await tokenService.cancelToken(token.id);
      fetchToken();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  const handleMarkAsUsed = async () => {
    if (!confirm(`Mark token ${token.token_id} as used?`)) return;

    try {
      await tokenService.markAsUsed(token.id);
      fetchToken();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark token as used');
    }
  };

  const handleRegenerateQR = async () => {
    if (!confirm(`Regenerate QR code for token ${token.token_id}?`)) return;

    try {
      await tokenService.regenerateQRCode(token.id);
      fetchToken();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate QR code');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      ACTIVE: 'status-active',
      USED: 'status-used',
      CANCELLED: 'status-cancelled'
    };
    return statusClasses[status] || 'status-active';
  };

  if (loading) {
    return <div className="token-detail-loading">Loading token details...</div>;
  }

  if (error) {
    return (
      <div className="token-detail-error">
        <p>{error}</p>
        <button onClick={onClose} className="btn btn-secondary">Close</button>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="token-detail-overlay">
      <div className="token-detail-modal">
        {/* Header */}
        <div className="token-detail-header">
          <div>
            <h2>Token Details</h2>
            <p className="token-id">{token.token_id}</p>
          </div>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        {/* Body */}
        <div className="token-detail-body">
          {/* Status Badge */}
          <div className="detail-section">
            <span className={`status-badge ${getStatusBadgeClass(token.status)} large`}>
              {token.status}
            </span>
          </div>

          {/* QR Code */}
          <div className="detail-section qr-section">
            <h3>QR Code</h3>
            {token.qr_code_url ? (
              <div className="qr-code-display">
                <img src={token.qr_code_url} alt="Token QR Code" className="qr-code-large" />
                <button
                  onClick={handleRegenerateQR}
                  className="btn btn-secondary btn-sm"
                  disabled={token.status !== 'ACTIVE'}
                >
                  Regenerate QR Code
                </button>
              </div>
            ) : (
              <p className="text-muted">No QR code available</p>
            )}
          </div>

          {/* Customer & Order Info */}
          <div className="detail-section">
            <h3>Customer & Order Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">{token.customer_name || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Order Number:</span>
                <span className="detail-value">{token.order_number || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Project:</span>
                <span className="detail-value">{token.project_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver Info */}
          <div className="detail-section">
            <h3>Vehicle & Driver Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Vehicle Number:</span>
                <span className="detail-value">{token.vehicle_number || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Driver Name:</span>
                <span className="detail-value">{token.driver_name || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Driver Phone:</span>
                <span className="detail-value">{token.driver_phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Print History */}
          <div className="detail-section">
            <h3>Print History</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Print Count:</span>
                <span className="detail-value">{token.print_count}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Printed:</span>
                <span className="detail-value">
                  {token.last_printed_at
                    ? new Date(token.last_printed_at).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Printed By:</span>
                <span className="detail-value">{token.last_printed_by_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {token.notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <p className="notes-text">{token.notes}</p>
            </div>
          )}

          {/* Audit Info */}
          <div className="detail-section">
            <h3>Audit Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(token.created_at).toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created By:</span>
                <span className="detail-value">{token.created_by_name || '-'}</span>
              </div>
              {token.updated_at && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Updated:</span>
                    <span className="detail-value">
                      {new Date(token.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Updated By:</span>
                    <span className="detail-value">{token.updated_by_name || '-'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="token-detail-footer">
          <div className="footer-actions">
            {token.status === 'ACTIVE' && (
              <>
                <button onClick={handlePrint} className="btn btn-primary">
                  🖨️ Print Token
                </button>
                {onEdit && (
                  <button onClick={() => onEdit(token)} className="btn btn-secondary">
                    ✏️ Edit
                  </button>
                )}
                <button onClick={handleMarkAsUsed} className="btn btn-success">
                  ✅ Mark as Used
                </button>
                <button onClick={handleCancel} className="btn btn-danger">
                  ❌ Cancel Token
                </button>
              </>
            )}
            {onPrint && token.status === 'ACTIVE' && (
              <button onClick={() => onPrint(token)} className="btn btn-primary">
                🖨️ Custom Print
              </button>
            )}
          </div>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail;
