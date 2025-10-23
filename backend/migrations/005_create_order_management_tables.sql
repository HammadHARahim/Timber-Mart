-- ============================================================================
-- Migration: 005 - Order Management System
-- Description: Create items, order_items tables and update orders table
-- Date: 2025-10-19
-- ============================================================================

-- Create items table for product catalog
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  name_urdu VARCHAR(200),
  description TEXT,
  unit VARCHAR(50) DEFAULT 'piece',
  default_price DECIMAL(15, 2),
  category VARCHAR(100),
  sku VARCHAR(100),
  minimum_quantity DECIMAL(10, 2) DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  -- User tracking
  created_by_user_id INTEGER REFERENCES users(id),
  updated_by_user_id INTEGER,

  -- Sync fields for offline-first
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP,
  device_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for items
CREATE INDEX idx_items_item_id ON items(item_id);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_active ON items(is_active);
CREATE INDEX idx_items_sync_status ON items(sync_status);

-- Create order_items table (junction table with snapshots)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,

  -- Foreign keys
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id),

  -- Snapshot fields (preserve item details at order time)
  item_name VARCHAR(200) NOT NULL,
  item_name_urdu VARCHAR(200),

  -- Quantity and pricing
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2),

  -- Discounts
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2),

  -- Final amount after discount
  final_amount DECIMAL(15, 2),

  -- Notes
  notes TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);

-- Update orders table with new fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id),
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,

  -- Financial fields
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS final_amount DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_amount DECIMAL(15, 2),

  -- Payment status
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'UNPAID',

  -- User tracking
  ADD COLUMN IF NOT EXISTS updated_by_user_id INTEGER REFERENCES users(id);

-- Add check constraints for orders
ALTER TABLE orders
  ADD CONSTRAINT chk_orders_payment_status
    CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID'));

-- Update existing orders to have default payment status
UPDATE orders
SET payment_status = 'UNPAID'
WHERE payment_status IS NULL;

-- Create trigger to update updated_at timestamp for items
CREATE OR REPLACE FUNCTION update_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_items_updated_at();

-- Insert sample items (optional - remove if not needed)
INSERT INTO items (item_id, name, name_urdu, category, unit, default_price, created_by_user_id) VALUES
  ('ITEM-1730000001', 'Cement Bag', 'سیمنٹ بیگ', 'Construction', 'bag', 950.00, 1),
  ('ITEM-1730000002', 'Steel Rod 10mm', 'سٹیل راڈ 10 ملی میٹر', 'Steel', 'kg', 280.00, 1),
  ('ITEM-1730000003', 'Bricks', 'اینٹیں', 'Construction', 'piece', 18.00, 1),
  ('ITEM-1730000004', 'Sand', 'ریت', 'Construction', 'cft', 85.00, 1),
  ('ITEM-1730000005', 'Gravel', 'بجری', 'Construction', 'cft', 95.00, 1)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================================================
-- Migration complete
-- ============================================================================
