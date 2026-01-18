-- Migration: Add Currency Support
-- Adds currency preference to workspaces for multi-currency billing

-- 1. Add currency column to workspaces (defaults to USD)
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd', 'eur', 'pln'));

-- 2. Create index for currency queries
CREATE INDEX IF NOT EXISTS idx_workspaces_currency ON workspaces(currency);

