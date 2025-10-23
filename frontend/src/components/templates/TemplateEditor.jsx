// ============================================================================
// FILE: src/components/templates/TemplateEditor.jsx
// Print template editor with live preview
// ============================================================================

import React, { useState, useEffect } from 'react';
import printTemplateService from '../../services/printTemplateService';
import printService from '../../services/printService';
import './TemplateEditor.css';

const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'CUSTOM',
    description: '',
    html_content: '',
    css_content: '',
    page_size: 'A4',
    orientation: 'PORTRAIT',
    margin_top: 20,
    margin_right: 20,
    margin_bottom: 20,
    margin_left: 20,
    is_default: false,
    is_active: true
  });

  const [placeholders, setPlaceholders] = useState([]);
  const [previewHTML, setPreviewHTML] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        type: template.type || 'CUSTOM',
        description: template.description || '',
        html_content: template.html_content || '',
        css_content: template.css_content || '',
        page_size: template.page_size || 'A4',
        orientation: template.orientation || 'PORTRAIT',
        margin_top: template.margin_top || 20,
        margin_right: template.margin_right || 20,
        margin_bottom: template.margin_bottom || 20,
        margin_left: template.margin_left || 20,
        is_default: template.is_default || false,
        is_active: template.is_active !== false
      });
    }
  }, [template]);

  useEffect(() => {
    if (formData.type) {
      fetchPlaceholders(formData.type);
    }
  }, [formData.type]);

  useEffect(() => {
    if (formData.html_content && formData.type) {
      generatePreview();
    }
  }, [formData.html_content, formData.css_content, formData.type]);

  const fetchPlaceholders = async (type) => {
    try {
      const response = await printTemplateService.getPlaceholders(type);
      // response.data.placeholders is an object, convert to array of keys
      const placeholdersObj = response.data?.placeholders || {};
      const placeholdersArray = Object.keys(placeholdersObj);
      setPlaceholders(placeholdersArray);
    } catch (err) {
      console.error('Failed to load placeholders:', err);
      setPlaceholders([]);
    }
  };

  const generatePreview = async () => {
    try {
      // previewTemplate returns { html, css, type } directly
      const previewData = await printService.previewTemplate(
        formData.html_content,
        formData.css_content,
        formData.type
      );

      // Check if previewData has the expected structure
      if (!previewData || !previewData.html) {
        console.error('Invalid preview response:', previewData);
        return;
      }

      // previewData contains { html, css, type }
      // Build preview HTML directly
      const previewHTML = `
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
                max-width: ${formData.page_size === 'THERMAL_80MM' ? '80mm' : formData.page_size === 'THERMAL_58MM' ? '58mm' : '210mm'};
                margin: 0 auto;
                background: white;
                padding: ${formData.margin_top}mm ${formData.margin_right}mm ${formData.margin_bottom}mm ${formData.margin_left}mm;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              ${previewData.css || ''}
            </style>
          </head>
          <body>
            <div class="print-preview-container">
              ${previewData.html || ''}
            </div>
          </body>
        </html>
      `;
      setPreviewHTML(previewHTML);
    } catch (err) {
      console.error('Failed to generate preview:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('html-content-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.html_content;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + `{{${placeholder}}}` + after;
    handleChange('html_content', newText);

    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length + 4, start + placeholder.length + 4);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.html_content) {
      setError('Name and HTML content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (template) {
        await printTemplateService.updateTemplate(template.id, formData);
      } else {
        await printTemplateService.createTemplate(formData);
      }

      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-editor-container">
      <form onSubmit={handleSubmit} className="template-editor-form">
        {/* Header */}
        <div className="editor-header">
          <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
          <div className="header-actions">
            <label className="preview-toggle">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
              />
              Show Preview
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className={`editor-layout ${showPreview ? 'with-preview' : 'full-width'}`}>
          {/* Left Panel - Editor */}
          <div className="editor-panel">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label htmlFor="name">Template Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Standard Invoice Template"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    required
                  >
                    <option value="TOKEN">Token</option>
                    <option value="INVOICE">Invoice</option>
                    <option value="RECEIPT">Receipt</option>
                    <option value="VOUCHER">Voucher</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="page_size">Page Size</label>
                  <select
                    id="page_size"
                    value={formData.page_size}
                    onChange={(e) => handleChange('page_size', e.target.value)}
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="LETTER">Letter</option>
                    <option value="THERMAL_80MM">Thermal 80mm</option>
                    <option value="THERMAL_58MM">Thermal 58mm</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="orientation">Orientation</label>
                  <select
                    id="orientation"
                    value={formData.orientation}
                    onChange={(e) => handleChange('orientation', e.target.value)}
                  >
                    <option value="PORTRAIT">Portrait</option>
                    <option value="LANDSCAPE">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Optional description of this template"
                  rows="2"
                />
              </div>
            </div>

            {/* Margins */}
            <div className="form-section">
              <h3>Margins (mm)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="margin_top">Top</label>
                  <input
                    id="margin_top"
                    type="number"
                    value={formData.margin_top}
                    onChange={(e) => handleChange('margin_top', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="margin_right">Right</label>
                  <input
                    id="margin_right"
                    type="number"
                    value={formData.margin_right}
                    onChange={(e) => handleChange('margin_right', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="margin_bottom">Bottom</label>
                  <input
                    id="margin_bottom"
                    type="number"
                    value={formData.margin_bottom}
                    onChange={(e) => handleChange('margin_bottom', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="margin_left">Left</label>
                  <input
                    id="margin_left"
                    type="number"
                    value={formData.margin_left}
                    onChange={(e) => handleChange('margin_left', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Placeholders */}
            <div className="form-section">
              <h3>Available Placeholders</h3>
              <div className="placeholders-list">
                {placeholders.map(ph => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => insertPlaceholder(ph)}
                    className="placeholder-chip"
                    title={`Click to insert {{${ph}}}`}
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            {/* HTML Content */}
            <div className="form-section">
              <h3>HTML Content *</h3>
              <textarea
                id="html-content-editor"
                value={formData.html_content}
                onChange={(e) => handleChange('html_content', e.target.value)}
                placeholder="Enter HTML content with placeholders like {{customer_name}}"
                rows="12"
                className="code-editor"
                required
              />
            </div>

            {/* CSS Content */}
            <div className="form-section">
              <h3>CSS Styles</h3>
              <textarea
                id="css-content-editor"
                value={formData.css_content}
                onChange={(e) => handleChange('css_content', e.target.value)}
                placeholder="Enter custom CSS styles (optional)"
                rows="8"
                className="code-editor"
              />
            </div>

            {/* Options */}
            <div className="form-section">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => handleChange('is_default', e.target.checked)}
                  />
                  Set as default template for this type
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" onClick={onCancel} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          {showPreview && (
            <div className="preview-panel">
              <h3>Live Preview</h3>
              <div className="preview-container">
                <iframe
                  srcDoc={previewHTML}
                  title="Template Preview"
                  className="preview-iframe"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TemplateEditor;
