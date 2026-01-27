-- Migration: Add Missing Foreign Key Indexes
-- Adds indexes on foreign key columns to improve join performance
-- This addresses database linter warnings for unindexed foreign keys

-- Add index on alerts.monitor_id (foreign key to monitors.id)
-- This improves performance when joining alerts with monitors
CREATE INDEX IF NOT EXISTS idx_alerts_monitor_id ON alerts(monitor_id);

-- Add index on workspace_members.invited_by (foreign key to profiles.id)
-- This improves performance when querying workspace members by inviter
CREATE INDEX IF NOT EXISTS idx_workspace_members_invited_by ON workspace_members(invited_by);

