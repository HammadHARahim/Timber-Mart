// ============================================================================
// FILE: src/pages/TemplatesPage.jsx
// Print templates management page
// ============================================================================

import React, { useState } from 'react';
import TemplateList from '../components/templates/TemplateList';
import TemplateEditor from '../components/templates/TemplateEditor';
import printTemplateService from '../services/printTemplateService';
import './TemplatesPage.css';

const TemplatesPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setView('editor');
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setView('editor');
  };

  const handleDuplicate = async (template) => {
    if (!confirm(`Duplicate template "${template.name}"?`)) return;

    try {
      await printTemplateService.duplicateTemplate(template.id);
      setRefreshTrigger(prev => prev + 1);
      alert('Template duplicated successfully');
    } catch (err) {
      alert(err.message || 'Failed to duplicate template');
    }
  };

  const handleDelete = async (template) => {
    if (!confirm(`Delete template "${template.name}"? This action cannot be undone.`)) return;

    try {
      await printTemplateService.deleteTemplate(template.id);
      setRefreshTrigger(prev => prev + 1);
      alert('Template deleted successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete template');
    }
  };

  const handleSave = () => {
    setView('list');
    setSelectedTemplate(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedTemplate(null);
  };

  return (
    <div className="templates-page">
      {/* Header */}
      {view === 'list' && (
        <div className="page-header">
          <div>
            <h1>Print Templates</h1>
            <p className="page-subtitle">Manage print templates for tokens, invoices, receipts, and vouchers</p>
          </div>
          <button onClick={handleCreate} className="btn-add-template">
            + Create Template
          </button>
        </div>
      )}

      {/* Content */}
      <div className="page-content">
        {view === 'list' ? (
          <TemplateList
            refreshTrigger={refreshTrigger}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ) : (
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
