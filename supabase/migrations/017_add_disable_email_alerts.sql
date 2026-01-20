-- Migration: Add option to disable email alerts when webhooks are configured
-- Allows users to disable email alerts if they have Slack/Discord/Custom webhooks set up

-- Add disable_email_alerts column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS disable_email_alerts BOOLEAN DEFAULT FALSE;

-- Add disable_email_alerts column to monitors (for per-monitor override)
ALTER TABLE monitors
  ADD COLUMN IF NOT EXISTS disable_email_alerts BOOLEAN DEFAULT FALSE;

