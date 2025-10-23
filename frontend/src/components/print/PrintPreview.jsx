// ============================================================================
// FILE: src/components/print/PrintPreview.jsx
// Print preview modal component
// ============================================================================

import React, { useState, useEffect } from 'react';
import printService from '../../services/printService';
import './PrintPreview.css';

const PrintPreview = ({ printData, onPrint, onClose, title = 'Print Preview' }) => {
  const [previewHTML, setPreviewHTML] = useState('');

  useEffect(() => {
    if (printData) {
      const html = printService.getPreviewHTML(printData);
      setPreviewHTML(html);
    }
  }, [printData]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint(printData);
    } else {
      printService.triggerPrint(printData);
    }
  };

  const handleDownloadPDF = () => {
    printService.downloadAsPDF(printData, `${title.replace(/\s+/g, '_')}.pdf`);
  };

  if (!printData) {
    return null;
  }

  return (
    <div className="print-preview-overlay">
      <div className="print-preview-modal">
        {/* Header */}
        <div className="print-preview-header">
          <h2>{title}</h2>
          <div className="header-actions">
            <button onClick={handlePrint} className="btn btn-primary">
              🖨️ Print
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-secondary">
              📄 Save as PDF
            </button>
            <button onClick={onClose} className="btn-close">✕</button>
          </div>
        </div>

        {/* Preview Info */}
        <div className="print-preview-info">
          <div className="info-item">
            <span className="info-label">Page Size:</span>
            <span className="info-value">{printData.pageSize || 'A4'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Orientation:</span>
            <span className="info-value">{printData.orientation || 'Portrait'}</span>
          </div>
          {printData.margins && (
            <div className="info-item">
              <span className="info-label">Margins:</span>
              <span className="info-value">
                {printData.margins.top}mm / {printData.margins.right}mm /
                {printData.margins.bottom}mm / {printData.margins.left}mm
              </span>
            </div>
          )}
        </div>

        {/* Preview Body */}
        <div className="print-preview-body">
          <iframe
            srcDoc={previewHTML}
            title="Print Preview"
            className="print-preview-iframe"
          />
        </div>

        {/* Footer */}
        <div className="print-preview-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            Print Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
