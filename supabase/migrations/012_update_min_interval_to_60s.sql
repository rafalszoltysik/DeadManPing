-- Migration: Update minimum interval constraint from 30s to 60s
-- Since cron jobs check monitors every 60 seconds, 30-second intervals are not achievable
-- Minimum interval is now 60 seconds (1 minute) for all plans

-- Drop existing constraint
ALTER TABLE monitors
  DROP CONSTRAINT IF EXISTS monitors_expected_interval_seconds_check;

-- Add new constraint with 60 seconds minimum
ALTER TABLE monitors
  ADD CONSTRAINT monitors_expected_interval_seconds_check
  CHECK (expected_interval_seconds >= 60);

-- Optional: Update existing monitors with intervals < 60s to 60s
-- This ensures all monitors comply with the new constraint
-- Uncomment the following lines if you want to automatically update existing monitors:

-- UPDATE monitors
-- SET expected_interval_seconds = 60,
--     updated_at = NOW()
-- WHERE expected_interval_seconds < 60;

-- Note: If you don't run the UPDATE above, existing monitors with intervals < 60s
-- will still work, but they cannot be updated until their interval is changed to >= 60s
-- The constraint will prevent creating new monitors with intervals < 60s

