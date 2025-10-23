-- ============================================================================
-- Migration: 009 - Alter Payments & Checks for Phase 7
-- Description: Add missing columns to existing payments table and update enums
-- Date: 2025-10-22
-- Phase: 7
-- ============================================================================

-- Add missing columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id),
  ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS check_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS check_date DATE,
  ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);

-- Add new enum values for payment_method (CHECK, CARD)
ALTER TYPE enum_payments_payment_method ADD VALUE IF NOT EXISTS 'CHECK';
ALTER TYPE enum_payments_payment_method ADD VALUE IF NOT EXISTS 'CARD';

-- Add new enum values for payment_status (COMPLETED, CANCELLED)
ALTER TYPE enum_payments_status ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE enum_payments_status ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Create index for project_id
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);

-- Check if checks table exists, if not create it
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
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_check_status') THEN
    ALTER TABLE checks
      ADD CONSTRAINT chk_check_status
        CHECK (status IN ('PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED'));
  END IF;
END $$;

-- Add check constraints for payee_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payee_type') THEN
    ALTER TABLE checks
      ADD CONSTRAINT chk_payee_type
        CHECK (payee_type IN ('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'));
  END IF;
END $$;

-- Create indexes for checks
CREATE INDEX IF NOT EXISTS idx_checks_check_id ON checks(check_id);
CREATE INDEX IF NOT EXISTS idx_checks_payment_id ON checks(payment_id);
CREATE INDEX IF NOT EXISTS idx_checks_customer_id ON checks(customer_id);
CREATE INDEX IF NOT EXISTS idx_checks_project_id ON checks(project_id);
CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(status);
CREATE INDEX IF NOT EXISTS idx_checks_check_date ON checks(check_date);
CREATE INDEX IF NOT EXISTS idx_checks_check_number ON checks(check_number);

-- Create trigger for checks updated_at if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_checks_updated_at') THEN
    CREATE TRIGGER trigger_checks_updated_at
      BEFORE UPDATE ON checks
      FOR EACH ROW
      EXECUTE FUNCTION update_checks_updated_at();
  END IF;
END $$;

-- ============================================================================
-- Migration complete
-- ============================================================================
