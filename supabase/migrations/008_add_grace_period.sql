-- Migration: Add Grace Period Support
-- Adds grace period functionality for trial expiry

-- 1. Add grace_period_ends_at to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMP WITH TIME ZONE;

-- 2. Add grace_period_ends_at to workspaces
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMP WITH TIME ZONE;

-- 3. Add 'paused' status to monitors (for monitors blocked after grace period)
ALTER TABLE monitors
  DROP CONSTRAINT IF EXISTS monitors_status_check;
ALTER TABLE monitors
  ADD CONSTRAINT monitors_status_check
  CHECK (status IN ('pending', 'healthy', 'late', 'failed', 'paused'));

-- 4. Add index for grace_period_ends_at queries
CREATE INDEX IF NOT EXISTS idx_profiles_grace_period_ends_at ON profiles(grace_period_ends_at)
  WHERE grace_period_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_grace_period_ends_at ON workspaces(grace_period_ends_at)
  WHERE grace_period_ends_at IS NOT NULL;

-- 5. Add index for paused monitors
CREATE INDEX IF NOT EXISTS idx_monitors_status_paused ON monitors(status)
  WHERE status = 'paused';

