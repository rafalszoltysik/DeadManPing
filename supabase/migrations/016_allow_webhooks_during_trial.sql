-- Migration: Allow Slack/Discord webhooks during trial period
-- Updates the validate_webhooks_by_tier function to allow webhooks during trial

CREATE OR REPLACE FUNCTION validate_webhooks_by_tier()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  user_status TEXT;
  workspace_tier TEXT;
  workspace_status TEXT;
BEGIN
  -- Try to get tier and status from workspace first (if user is owner)
  SELECT w.subscription_tier, w.subscription_status INTO workspace_tier, workspace_status
  FROM workspaces w
  WHERE w.owner_id = NEW.id
  LIMIT 1;
  
  -- Use workspace tier/status if found, otherwise use profile
  IF workspace_tier IS NOT NULL THEN
    user_tier := workspace_tier;
    user_status := workspace_status;
  ELSE
    user_tier := COALESCE(NEW.subscription_tier, 'free');
    user_status := COALESCE(NEW.subscription_status, 'free');
  END IF;
  
  -- Allow Slack/Discord webhooks during trial (trialing status with free tier)
  -- or for paid tiers (starter, pro, team)
  IF user_tier = 'free' AND user_status != 'trialing' THEN
    IF NEW.slack_webhook_url IS NOT NULL OR NEW.discord_webhook_url IS NOT NULL THEN
      RAISE EXCEPTION 'Slack and Discord webhooks are only available on Starter, Pro, or Team plans, or during the 14-day free trial';
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

