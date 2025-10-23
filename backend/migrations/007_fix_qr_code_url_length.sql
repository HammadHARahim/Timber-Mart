-- ============================================================================
-- Migration: 007 - Fix QR Code URL Length
-- Description: Change qr_code_url from VARCHAR(500) to TEXT to support base64 data URLs
-- Date: 2025-10-19
-- Phase: 6 (Hotfix)
-- ============================================================================

-- Alter tokens table to change qr_code_url to TEXT
ALTER TABLE tokens
  ALTER COLUMN qr_code_url TYPE TEXT;

-- ============================================================================
-- Migration complete
-- ============================================================================
