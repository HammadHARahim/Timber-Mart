-- ============================================================================
-- Migration: 010 - Add Balance to Projects
-- Description: Add balance field to projects table for Phase 8
-- Date: 2025-10-22
-- Phase: 8
-- ============================================================================

-- Add balance column to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS balance DECIMAL(15, 2) DEFAULT 0;

-- Update existing projects to calculate balance
-- Balance = actual_amount (if set) OR estimated_amount
UPDATE projects
SET balance = COALESCE(actual_amount, estimated_amount, 0)
WHERE balance IS NULL OR balance = 0;

-- ============================================================================
-- Migration complete
-- ============================================================================
