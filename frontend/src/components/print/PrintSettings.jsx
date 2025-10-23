// ============================================================================
// FILE: src/components/print/PrintSettings.jsx
// User print settings management
// ============================================================================

import React, { useState, useEffect } from 'react';
import printService from '../../services/printService';
import printTemplateService from '../../services/printTemplateService';
import './PrintSettings.css';

const PrintSettings = () => {
  const [settings, setSettings] = useState({
    default_token_template_id: '',
    default_invoice_template_id: '',
    default_receipt_template_id: '',
    default_voucher_template_id: '',
    printer_type: 'NORMAL',
    thermal_printer_width: 80,
    show_print_preview: true,
    auto_print: false,
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_logo_url: ''
  });

  const [templates, setTemplates] = useState({
    TOKEN: [],
    INVOICE: [],
    RECEIPT: [],
    VOUCHER: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await printService.getUserSettings();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const types = ['TOKEN', 'INVOICE', 'RECEIPT', 'VOUCHER'];
      const promises = types.map(type =>
        printTemplateService.getAllTemplates({ type, is_active: true, limit: 100 })
      );

      const results = await Promise.all(promises);

      const templatesData = {};
      types.forEach((type, index) => {
        templatesData[type] = results[index]?.data?.templates || [];
      });

      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Set empty arrays on error
      setTemplates({
        TOKEN: [],
        INVOICE: [],
        RECEIPT: [],
        VOUCHER: []
      });
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await printService.updateUserSettings(settings);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="print-settings-loading">Loading print settings...</div>;
  }

  return (
    <div className="print-settings-container">
      <form onSubmit={handleSubmit} className="print-settings-form">
        <div className="settings-header">
          <h2>Print Settings</h2>
          <p className="settings-subtitle">Configure your printing preferences and defaults</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Settings saved successfully!</div>}

        {/* Default Templates */}
        <div className="settings-section">
          <h3>Default Templates</h3>
          <p className="section-description">
            Select default templates for each print type. These will be used when no specific template is chosen.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="default_token_template_id">Token Template</label>
              <select
                id="default_token_template_id"
                value={settings.default_token_template_id}
                onChange={(e) => handleChange('default_token_template_id', e.target.value)}
              >
                <option value="">System Default</option>
                {templates.TOKEN.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="default_invoice_template_id">Invoice Template</label>
              <select
                id="default_invoice_template_id"
                value={settings.default_invoice_template_id}
                onChange={(e) => handleChange('default_invoice_template_id', e.target.value)}
              >
                <option value="">System Default</option>
                {templates.INVOICE.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="default_receipt_template_id">Receipt Template</label>
              <select
                id="default_receipt_template_id"
                value={settings.default_receipt_template_id}
                onChange={(e) => handleChange('default_receipt_template_id', e.target.value)}
              >
                <option value="">System Default</option>
                {templates.RECEIPT.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="default_voucher_template_id">Voucher Template</label>
              <select
                id="default_voucher_template_id"
                value={settings.default_voucher_template_id}
                onChange={(e) => handleChange('default_voucher_template_id', e.target.value)}
              >
                <option value="">System Default</option>
                {templates.VOUCHER.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Printer Settings */}
        <div className="settings-section">
          <h3>Printer Configuration</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="printer_type">Printer Type</label>
              <select
                id="printer_type"
                value={settings.printer_type}
                onChange={(e) => handleChange('printer_type', e.target.value)}
              >
                <option value="NORMAL">Normal Printer</option>
                <option value="THERMAL">Thermal Printer</option>
                <option value="PDF">PDF Only</option>
              </select>
            </div>

            {settings.printer_type === 'THERMAL' && (
              <div className="form-group">
                <label htmlFor="thermal_printer_width">Thermal Printer Width (mm)</label>
                <select
                  id="thermal_printer_width"
                  value={settings.thermal_printer_width}
                  onChange={(e) => handleChange('thermal_printer_width', parseInt(e.target.value))}
                >
                  <option value="58">58mm</option>
                  <option value="80">80mm</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.show_print_preview}
                onChange={(e) => handleChange('show_print_preview', e.target.checked)}
              />
              Show print preview before printing
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.auto_print}
                onChange={(e) => handleChange('auto_print', e.target.checked)}
              />
              Auto-print after generating (skip preview)
            </label>
          </div>
        </div>

        {/* Company Information */}
        <div className="settings-section">
          <h3>Company Information</h3>
          <p className="section-description">
            This information will be used in print templates and can be accessed via placeholders.
          </p>

          <div className="form-group">
            <label htmlFor="company_name">Company Name</label>
            <input
              id="company_name"
              type="text"
              value={settings.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Your Company Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_address">Company Address</label>
            <textarea
              id="company_address"
              value={settings.company_address}
              onChange={(e) => handleChange('company_address', e.target.value)}
              placeholder="Complete company address"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company_phone">Company Phone</label>
              <input
                id="company_phone"
                type="tel"
                value={settings.company_phone}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                placeholder="Contact phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company_email">Company Email</label>
              <input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) => handleChange('company_email', e.target.value)}
                placeholder="Contact email address"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company_logo_url">Company Logo URL</label>
            <input
              id="company_logo_url"
              type="url"
              value={settings.company_logo_url}
              onChange={(e) => handleChange('company_logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {settings.company_logo_url && (
              <div className="logo-preview">
                <img src={settings.company_logo_url} alt="Company Logo" />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={fetchSettings} className="btn btn-secondary">
            Reset Changes
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrintSettings;
