-- Migration: Remove Currency Column
-- Currency will be detected from user's country (IP-based) or stored in localStorage
-- For users with active subscriptions, currency comes from Stripe subscription

-- Remove currency column from workspaces
ALTER TABLE workspaces
  DROP COLUMN IF EXISTS currency;

-- Drop index for currency
DROP INDEX IF EXISTS idx_workspaces_currency;

