-- ============================================================================
-- Migration: 008 - Payments & Checks System
-- Description: Create payments and checks tables for Phase 7
-- Date: 2025-10-22
-- Phase: 7
-- ============================================================================

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(50) UNIQUE NOT NULL,

  -- Related entities
  customer_id INTEGER REFERENCES customers(id),
  project_id INTEGER REFERENCES projects(id),
  order_id INTEGER REFERENCES orders(id),

  -- Payment details
  amount DECIMAL(15, 2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL, -- LOAN, ADVANCE, DEPOSIT, ORDER_PAYMENT
  payment_method VARCHAR(20) NOT NULL, -- CASH, BANK_TRANSFER, CHECK, CARD
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Payment metadata
  reference_number VARCHAR(100),
  description TEXT,
  notes TEXT,

  -- Bank/Check details (if applicable)
  bank_name VARCHAR(200),
  check_number VARCHAR(50),
  check_date DATE,
  account_number VARCHAR(50),

  -- Approval workflow
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COMPLETED
  approved_by_user_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,

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

-- Add check constraints for payment_type
ALTER TABLE payments
  ADD CONSTRAINT chk_payment_type
    CHECK (payment_type IN ('LOAN', 'ADVANCE', 'DEPOSIT', 'ORDER_PAYMENT', 'REFUND'));

-- Add check constraints for payment_method
ALTER TABLE payments
  ADD CONSTRAINT chk_payment_method
    CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CHECK', 'CARD', 'ONLINE'));

-- Add check constraints for payment status
ALTER TABLE payments
  ADD CONSTRAINT chk_payment_status
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'));

-- Create indexes for payments
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);

-- Create checks table
CREATE TABLE IF NOT EXISTS checks (
  id SERIAL PRIMARY KEY,
  check_id VARCHAR(50) UNIQUE NOT NULL,

  -- Related payment (optional)
  payment_id INTEGER REFERENCES payments(id),
  customer_id INTEGER REFERENCES customers(id),
  project_id INTEGER REFERENCES projects(id),

  -- Check details
  check_number VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  check_date DATE NOT NULL,
  bank_name VARCHAR(200),
  account_number VARCHAR(50),

  -- Payee information
  payee_name VARCHAR(200),
  payee_type VARCHAR(20), -- CUSTOMER, SUPPLIER, EMPLOYEE, OTHER

  -- Check status
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CLEARED, BOUNCED, CANCELLED
  cleared_date DATE,

  -- Additional info
  notes TEXT,

  -- User tracking
  created_by_user_id INTEGER REFERENCES users(id),
  cleared_by_user_id INTEGER REFERENCES users(id),

  -- Sync fields
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP,
  device_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraints for check status
ALTER TABLE checks
  ADD CONSTRAINT chk_check_status
    CHECK (status IN ('PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED'));

-- Add check constraints for payee_type
ALTER TABLE checks
  ADD CONSTRAINT chk_payee_type
    CHECK (payee_type IN ('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'));

-- Create indexes for checks
CREATE INDEX idx_checks_check_id ON checks(check_id);
CREATE INDEX idx_checks_payment_id ON checks(payment_id);
CREATE INDEX idx_checks_customer_id ON checks(customer_id);
CREATE INDEX idx_checks_project_id ON checks(project_id);
CREATE INDEX idx_checks_status ON checks(status);
CREATE INDEX idx_checks_check_date ON checks(check_date);
CREATE INDEX idx_checks_check_number ON checks(check_number);

-- Create trigger to update updated_at timestamp for payments
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Create trigger to update updated_at timestamp for checks
CREATE OR REPLACE FUNCTION update_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_checks_updated_at
  BEFORE UPDATE ON checks
  FOR EACH ROW
  EXECUTE FUNCTION update_checks_updated_at();

-- ============================================================================
-- Migration complete
-- ============================================================================
