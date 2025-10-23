// ============================================================================
// FILE: src/pages/PrintSettingsPage.jsx
// Print settings page wrapper
// ============================================================================

import React from 'react';
import PrintSettings from '../components/print/PrintSettings';
import './PrintSettingsPage.css';

const PrintSettingsPage = () => {
  return (
    <div className="print-settings-page">
      <div className="page-header">
        <div>
          <h1>Print Settings</h1>
          <p className="page-subtitle">Configure your printing preferences, default templates, and company information</p>
        </div>
      </div>

      <div className="page-content">
        <PrintSettings />
      </div>
    </div>
  );
};

export default PrintSettingsPage;
