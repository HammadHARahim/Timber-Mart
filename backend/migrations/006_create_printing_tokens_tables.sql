-- ============================================================================
-- Migration: 006 - Printing & Tokens System
-- Description: Create print_templates, tokens, and print_settings tables
-- Date: 2025-10-19
-- Phase: 6
-- ============================================================================

-- Create print_templates table
CREATE TABLE IF NOT EXISTS print_templates (
  id SERIAL PRIMARY KEY,
  template_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM',

  -- Template content
  html_content TEXT NOT NULL,
  css_content TEXT,

  -- Print settings
  page_size VARCHAR(20) DEFAULT 'A4',
  orientation VARCHAR(10) DEFAULT 'PORTRAIT',
  margin_top DECIMAL(5, 2) DEFAULT 10,
  margin_bottom DECIMAL(5, 2) DEFAULT 10,
  margin_left DECIMAL(5, 2) DEFAULT 10,
  margin_right DECIMAL(5, 2) DEFAULT 10,

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,

  -- User tracking
  created_by_user_id INTEGER REFERENCES users(id),
  updated_by_user_id INTEGER REFERENCES users(id),

  -- Sync fields
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP,
  device_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraint for template type
ALTER TABLE print_templates
  ADD CONSTRAINT chk_template_type
    CHECK (type IN ('TOKEN', 'INVOICE', 'RECEIPT', 'VOUCHER', 'CUSTOM'));

-- Add check constraint for orientation
ALTER TABLE print_templates
  ADD CONSTRAINT chk_template_orientation
    CHECK (orientation IN ('PORTRAIT', 'LANDSCAPE'));

-- Create indexes for print_templates
CREATE INDEX idx_print_templates_template_id ON print_templates(template_id);
CREATE INDEX idx_print_templates_type ON print_templates(type);
CREATE INDEX idx_print_templates_is_default ON print_templates(is_default);
CREATE INDEX idx_print_templates_created_by ON print_templates(created_by_user_id);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(50) UNIQUE NOT NULL,

  -- Related entities
  order_id INTEGER REFERENCES orders(id),
  customer_id INTEGER REFERENCES customers(id),
  project_id INTEGER REFERENCES projects(id),

  -- Token data snapshots
  customer_name VARCHAR(200),
  project_name VARCHAR(200),
  vehicle_number VARCHAR(50),
  vehicle_type VARCHAR(100),
  driver_name VARCHAR(200),
  driver_phone VARCHAR(20),

  -- Token details
  token_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_address TEXT,
  notes TEXT,

  -- QR Code data
  qr_code_data TEXT,
  qr_code_url VARCHAR(500),

  -- Print tracking
  print_count INTEGER DEFAULT 0,
  last_printed_at TIMESTAMP,
  printed_by_user_id INTEGER REFERENCES users(id),

  -- Template used
  template_id INTEGER REFERENCES print_templates(id),

  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',

  -- User tracking
  created_by_user_id INTEGER REFERENCES users(id),

  -- Sync fields
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP,
  device_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraint for token status
ALTER TABLE tokens
  ADD CONSTRAINT chk_token_status
    CHECK (status IN ('ACTIVE', 'USED', 'CANCELLED'));

-- Create indexes for tokens
CREATE INDEX idx_tokens_token_id ON tokens(token_id);
CREATE INDEX idx_tokens_order_id ON tokens(order_id);
CREATE INDEX idx_tokens_customer_id ON tokens(customer_id);
CREATE INDEX idx_tokens_status ON tokens(status);
CREATE INDEX idx_tokens_token_date ON tokens(token_date);

-- Create print_settings table
CREATE TABLE IF NOT EXISTS print_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),

  -- Default template preferences
  default_token_template_id INTEGER REFERENCES print_templates(id),
  default_invoice_template_id INTEGER REFERENCES print_templates(id),
  default_receipt_template_id INTEGER REFERENCES print_templates(id),
  default_voucher_template_id INTEGER REFERENCES print_templates(id),

  -- Printer preferences
  preferred_printer VARCHAR(200),
  printer_type VARCHAR(20) DEFAULT 'NORMAL',
  thermal_printer_width INTEGER DEFAULT 80,

  -- Print behavior
  auto_print_on_create BOOLEAN DEFAULT false,
  show_print_preview BOOLEAN DEFAULT true,
  print_copies INTEGER DEFAULT 1,

  -- Page settings
  default_page_size VARCHAR(20) DEFAULT 'A4',
  default_orientation VARCHAR(10) DEFAULT 'PORTRAIT',
  default_margin_top DECIMAL(5, 2) DEFAULT 10,
  default_margin_bottom DECIMAL(5, 2) DEFAULT 10,
  default_margin_left DECIMAL(5, 2) DEFAULT 10,
  default_margin_right DECIMAL(5, 2) DEFAULT 10,

  -- QR Code settings
  include_qr_code BOOLEAN DEFAULT true,
  qr_code_size INTEGER DEFAULT 128,

  -- Company info
  company_name VARCHAR(200),
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(100),
  company_logo_url VARCHAR(500),

  -- Additional preferences
  preferences JSON,

  -- Sync fields
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraint for printer type
ALTER TABLE print_settings
  ADD CONSTRAINT chk_printer_type
    CHECK (printer_type IN ('THERMAL', 'NORMAL', 'PDF'));

-- Add check constraint for orientation
ALTER TABLE print_settings
  ADD CONSTRAINT chk_print_settings_orientation
    CHECK (default_orientation IN ('PORTRAIT', 'LANDSCAPE'));

-- Create index for print_settings
CREATE INDEX idx_print_settings_user_id ON print_settings(user_id);

-- Create trigger to update updated_at timestamp for print_templates
CREATE OR REPLACE FUNCTION update_print_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_print_templates_updated_at
  BEFORE UPDATE ON print_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_print_templates_updated_at();

-- Create trigger to update updated_at timestamp for tokens
CREATE OR REPLACE FUNCTION update_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_tokens_updated_at();

-- Create trigger to update updated_at timestamp for print_settings
CREATE OR REPLACE FUNCTION update_print_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_print_settings_updated_at
  BEFORE UPDATE ON print_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_print_settings_updated_at();

-- Insert sample/default print templates
INSERT INTO print_templates (template_id, name, description, type, html_content, css_content, is_default, created_by_user_id) VALUES
(
  'TPL-DEFAULT-TOKEN',
  'Default Token Template',
  'Default template for printing tokens',
  'TOKEN',
  '<!DOCTYPE html>
<html>
<head><title>Token</title></head>
<body>
  <div class="token-container">
    <h1>{{company_name}}</h1>
    <h2>Delivery Token</h2>
    <div class="qr-code">
      <img src="{{qr_code}}" alt="QR Code" />
    </div>
    <table>
      <tr><td>Token #:</td><td><strong>{{token_id}}</strong></td></tr>
      <tr><td>Date:</td><td>{{date}} {{time}}</td></tr>
      <tr><td>Customer:</td><td>{{customer_name}}</td></tr>
      <tr><td>Project:</td><td>{{project_name}}</td></tr>
      <tr><td>Vehicle:</td><td>{{vehicle_number}} ({{vehicle_type}})</td></tr>
      <tr><td>Driver:</td><td>{{driver_name}} - {{driver_phone}}</td></tr>
      <tr><td>Delivery:</td><td>{{delivery_address}}</td></tr>
    </table>
    <div class="notes">{{notes}}</div>
  </div>
</body>
</html>',
  'body { font-family: Arial; margin: 20px; }
.token-container { border: 2px solid #000; padding: 20px; }
h1 { text-align: center; margin: 0; }
h2 { text-align: center; color: #666; }
.qr-code { text-align: center; margin: 20px 0; }
.qr-code img { width: 150px; height: 150px; }
table { width: 100%; margin: 20px 0; }
td { padding: 5px; }
.notes { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }',
  true,
  1
),
(
  'TPL-DEFAULT-INVOICE',
  'Default Invoice Template',
  'Default template for printing invoices',
  'INVOICE',
  '<!DOCTYPE html>
<html>
<head><title>Invoice</title></head>
<body>
  <div class="invoice-container">
    <h1>{{company_name}}</h1>
    <h2>INVOICE</h2>
    <table class="header-table">
      <tr><td>Invoice #:</td><td>{{invoice_number}}</td></tr>
      <tr><td>Order #:</td><td>{{order_id}}</td></tr>
      <tr><td>Date:</td><td>{{date}}</td></tr>
    </table>
    <div class="customer-info">
      <strong>Bill To:</strong><br/>
      {{customer_name}}<br/>
      {{customer_address}}<br/>
      {{customer_phone}}
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Discount</th><th>Total</th>
        </tr>
      </thead>
      <tbody>
        {{items_table}}
      </tbody>
    </table>
    <div class="totals">
      <div>Subtotal: {{subtotal}}</div>
      <div>Discount: {{discount}}</div>
      <div class="grand-total">Total: {{total}}</div>
      <div>Paid: {{paid}}</div>
      <div>Balance: {{balance}}</div>
    </div>
  </div>
</body>
</html>',
  'body { font-family: Arial; margin: 20px; }
.invoice-container { max-width: 800px; }
h1, h2 { text-align: center; }
.header-table { width: 100%; margin: 20px 0; }
.customer-info { margin: 20px 0; padding: 10px; background: #f5f5f5; }
.items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; }
.items-table th { background: #f0f0f0; }
.totals { text-align: right; margin: 20px 0; }
.grand-total { font-size: 18px; font-weight: bold; margin: 10px 0; }',
  true,
  1
)
ON CONFLICT (template_id) DO NOTHING;

-- ============================================================================
-- Migration complete
-- ============================================================================
