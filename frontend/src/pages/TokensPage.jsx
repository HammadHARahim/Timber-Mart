// ============================================================================
// FILE: src/pages/TokensPage.jsx
// Tokens management page
// ============================================================================

import React, { useState } from 'react';
import TokenList from '../components/tokens/TokenList';
import TokenForm from '../components/tokens/TokenForm';
import TokenDetail from '../components/tokens/TokenDetail';
import PrintPreview from '../components/print/PrintPreview';
import printService from '../services/printService';
import tokenService from '../services/tokenService';
import './TokensPage.css';

const TokensPage = () => {
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printData, setPrintData] = useState(null);

  const handleCreate = () => {
    setSelectedToken(null);
    setView('form');
  };

  const handleEdit = (token) => {
    setSelectedToken(token);
    setView('form');
  };

  const handleView = (token) => {
    setSelectedTokenId(token.id);
    setView('detail');
  };

  const handlePrint = async (token) => {
    try {
      // Record print event
      await tokenService.recordPrint(token.id);

      // Generate print data
      const response = await printService.generateTokenPrint(token.id);
      setPrintData(response.data);
      setShowPrintPreview(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate print');
    }
  };

  const handlePrintNow = (data) => {
    printService.triggerPrint(data);
    setShowPrintPreview(false);
    setPrintData(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClosePrintPreview = () => {
    setShowPrintPreview(false);
    setPrintData(null);
  };

  const handleSave = () => {
    setView('list');
    setSelectedToken(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedToken(null);
  };

  const handleCloseDetail = () => {
    setView('list');
    setSelectedTokenId(null);
  };

  return (
    <div className="tokens-page">
      {/* Header */}
      {view === 'list' && (
        <div className="page-header">
          <div>
            <h1>Delivery Tokens</h1>
            <p className="page-subtitle">Manage delivery tokens with QR codes for orders and deliveries</p>
          </div>
          <button onClick={handleCreate} className="btn-add-token">
            + Create Token
          </button>
        </div>
      )}

      {/* Content */}
      <div className="page-content">
        {view === 'list' && (
          <TokenList
            key={refreshTrigger}
            onEdit={handleEdit}
            onView={handleView}
            onPrint={handlePrint}
          />
        )}

        {view === 'form' && (
          <TokenForm
            token={selectedToken}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {view === 'detail' && selectedTokenId && (
          <TokenDetail
            tokenId={selectedTokenId}
            onClose={handleCloseDetail}
            onEdit={(token) => {
              setSelectedToken(token);
              setView('form');
            }}
            onPrint={handlePrint}
          />
        )}
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && printData && (
        <PrintPreview
          printData={printData}
          onPrint={handlePrintNow}
          onClose={handleClosePrintPreview}
          title="Token Print Preview"
        />
      )}
    </div>
  );
};

export default TokensPage;
