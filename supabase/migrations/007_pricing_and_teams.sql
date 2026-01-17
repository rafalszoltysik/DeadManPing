-- Migration: Pricing Update + Team Collaboration
-- Updates pricing tiers and adds workspace/team support

-- 1. Update subscription tiers (free, starter, pro, team)
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team'));

-- 2. Add custom_webhook_url for team plan
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS custom_webhook_url TEXT;

-- 2b. Add alert_email for custom alert email address (optional, defaults to email if not set)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS alert_email TEXT;

-- 3. Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team')),
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'past_due')),
  max_members INTEGER DEFAULT 1 CHECK (max_members >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workspace_id, user_id)
);

-- 5. Update monitors to support workspaces
ALTER TABLE monitors
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 5b. Add alert channel overrides per monitor (optional, falls back to profile/workspace settings)
ALTER TABLE monitors
  ADD COLUMN IF NOT EXISTS alert_email TEXT;
ALTER TABLE monitors
  ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;
ALTER TABLE monitors
  ADD COLUMN IF NOT EXISTS discord_webhook_url TEXT;
ALTER TABLE monitors
  ADD COLUMN IF NOT EXISTS custom_webhook_url TEXT;

-- Update constraint for 30-second intervals (team plan)
ALTER TABLE monitors
  DROP CONSTRAINT IF EXISTS monitors_expected_interval_seconds_check;
ALTER TABLE monitors
  ADD CONSTRAINT monitors_expected_interval_seconds_check
  CHECK (expected_interval_seconds >= 30);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_workspace_id ON monitors(workspace_id);

-- 7. Migrate existing data: create workspace for each user
INSERT INTO workspaces (id, name, slug, owner_id, subscription_tier, subscription_status, max_members)
SELECT 
  uuid_generate_v4(),
  COALESCE(p.email, 'My Workspace') || '''s Workspace',
  'workspace-' || p.id::text,
  p.id,
  CASE 
    WHEN p.subscription_tier = 'solo' THEN 'starter'
    WHEN p.subscription_tier = 'agency' THEN 'pro'
    ELSE p.subscription_tier
  END,
  p.subscription_status,
  CASE 
    WHEN p.subscription_tier = 'agency' THEN 3
    ELSE 1
  END
FROM profiles p
ON CONFLICT DO NOTHING;

-- Update monitors to use workspace
UPDATE monitors m
SET workspace_id = (
  SELECT w.id 
  FROM workspaces w 
  WHERE w.owner_id = m.user_id 
  LIMIT 1
)
WHERE workspace_id IS NULL;

-- Create workspace_members for existing users
INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
SELECT w.id, w.owner_id, 'owner', w.created_at
FROM workspaces w
ON CONFLICT DO NOTHING;

-- 8. RLS Policies for workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspaces: users can see workspaces they're members of
DROP POLICY IF EXISTS "Users can view workspace if member" ON workspaces;
CREATE POLICY "Users can view workspace if member" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspaces.id
      AND wm.user_id = auth.uid()
    )
  );

-- Workspaces: users can create workspace for themselves
DROP POLICY IF EXISTS "Users can create workspace" ON workspaces;
CREATE POLICY "Users can create workspace" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspaces: owners can update (but subscription_tier should only be changed via webhook)
DROP POLICY IF EXISTS "Owners can update workspace" ON workspaces;
CREATE POLICY "Owners can update workspace" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

-- Workspace members: users can see members of their workspaces
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm2
      WHERE wm2.workspace_id = workspace_members.workspace_id
      AND wm2.user_id = auth.uid()
    )
  );

-- Workspace members: owners/admins can add members
DROP POLICY IF EXISTS "Owners/admins can add members" ON workspace_members;
CREATE POLICY "Owners/admins can add members" ON workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Workspace members: owners/admins can remove members
DROP POLICY IF EXISTS "Owners/admins can remove members" ON workspace_members;
CREATE POLICY "Owners/admins can remove members" ON workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Update monitors RLS to check workspace membership
DROP POLICY IF EXISTS "Users can view own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can view monitors in workspace" ON monitors;
CREATE POLICY "Users can view monitors in workspace" ON monitors
  FOR SELECT USING (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can insert monitors in workspace" ON monitors;
CREATE POLICY "Users can insert monitors in workspace" ON monitors
  FOR INSERT WITH CHECK (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can update monitors in workspace" ON monitors;
CREATE POLICY "Users can update monitors in workspace" ON monitors
  FOR UPDATE USING (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can delete monitors in workspace" ON monitors;
CREATE POLICY "Users can delete monitors in workspace" ON monitors
  FOR DELETE USING (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Update pings RLS
DROP POLICY IF EXISTS "Users can view pings for own monitors" ON pings;
DROP POLICY IF EXISTS "Users can view pings for workspace monitors" ON pings;
CREATE POLICY "Users can view pings for workspace monitors" ON pings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors m
      JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE m.id = pings.monitor_id
      AND wm.user_id = auth.uid()
    )
  );

-- Update alerts RLS
DROP POLICY IF EXISTS "Users can view alerts for own monitors" ON alerts;
DROP POLICY IF EXISTS "Users can view alerts for workspace monitors" ON alerts;
CREATE POLICY "Users can view alerts for workspace monitors" ON alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors m
      JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE m.id = alerts.monitor_id
      AND wm.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate webhook URLs based on subscription tier
CREATE OR REPLACE FUNCTION validate_webhooks_by_tier()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
BEGIN
  -- Try to get tier from workspace first
  SELECT w.subscription_tier INTO user_tier
  FROM workspaces w
  JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE wm.user_id = NEW.id
  LIMIT 1;
  
  -- Fallback to profile tier if no workspace found
  IF user_tier IS NULL THEN
    user_tier := COALESCE(NEW.subscription_tier, 'free');
  END IF;
  
  -- Block Slack/Discord webhooks for free tier
  IF user_tier = 'free' THEN
    IF NEW.slack_webhook_url IS NOT NULL OR NEW.discord_webhook_url IS NOT NULL THEN
      RAISE EXCEPTION 'Slack and Discord webhooks are only available on Starter, Pro, or Team plans';
    END IF;
  END IF;
  
  -- Block custom webhook for non-team tiers
  IF user_tier != 'team' THEN
    IF NEW.custom_webhook_url IS NOT NULL THEN
      RAISE EXCEPTION 'Custom webhooks are only available on Team plan';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate webhooks on profile update
DROP TRIGGER IF EXISTS validate_profile_webhooks ON profiles;
CREATE TRIGGER validate_profile_webhooks BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (
    OLD.slack_webhook_url IS DISTINCT FROM NEW.slack_webhook_url OR
    OLD.discord_webhook_url IS DISTINCT FROM NEW.discord_webhook_url OR
    OLD.custom_webhook_url IS DISTINCT FROM NEW.custom_webhook_url
  )
  EXECUTE FUNCTION validate_webhooks_by_tier();

