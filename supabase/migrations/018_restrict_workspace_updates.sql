-- Migration: Restrict Workspace Updates to Prevent Subscription Manipulation
-- This migration fixes a critical security vulnerability where users could
-- directly update their subscription_tier, max_members, and other sensitive fields
-- by bypassing payment.

-- Create a function to check if an update is trying to modify sensitive fields
-- This function will be used in the RLS policy to prevent unauthorized updates
CREATE OR REPLACE FUNCTION check_workspace_update_allowed()
RETURNS TRIGGER AS $$
DECLARE
  jwt_role TEXT;
  jwt_claims JSONB;
BEGIN
  -- Check if any sensitive fields are being modified
  IF (
    OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier OR
    OLD.subscription_status IS DISTINCT FROM NEW.subscription_status OR
    OLD.max_members IS DISTINCT FROM NEW.max_members OR
    OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id OR
    OLD.grace_period_ends_at IS DISTINCT FROM NEW.grace_period_ends_at
  ) THEN
    -- Check if this is a service role update (webhook)
    -- Service role bypasses RLS, so we need to check the JWT claims for the role
    
    -- Try to get JWT claims to check role
    BEGIN
      jwt_claims := current_setting('request.jwt.claims', true)::jsonb;
      jwt_role := jwt_claims->>'role';
    EXCEPTION WHEN OTHERS THEN
      -- If we can't get JWT claims, try alternative method
      -- When service role is used, auth.uid() might be NULL or we can check differently
      jwt_role := NULL;
    END;
    
    -- Allow if jwt_role is 'service_role' (webhook updates)
    -- Also allow if we can't determine the role but auth.uid() is NULL
    -- (this happens when RLS is bypassed by service role in some configurations)
    IF jwt_role = 'service_role' OR (jwt_role IS NULL AND auth.uid() IS NULL) THEN
      -- This is a service role update (webhook) - allow it
      RETURN NEW;
    ELSE
      -- This is a regular user trying to update sensitive fields - deny it
      RAISE EXCEPTION 'Cannot update subscription-related fields directly. These fields can only be updated via Stripe webhooks.';
    END IF;
  END IF;
  
  -- Allow updates to non-sensitive fields (name, slug, updated_at)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce the restriction
DROP TRIGGER IF EXISTS restrict_workspace_sensitive_updates ON workspaces;
CREATE TRIGGER restrict_workspace_sensitive_updates
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION check_workspace_update_allowed();

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Owners can update workspace" ON workspaces;

-- Create a new restrictive policy that only allows updates to non-sensitive fields
-- Note: The trigger above will enforce that sensitive fields cannot be updated
-- This policy ensures only owners can update their workspaces
CREATE POLICY "Owners can update workspace (restricted)" ON workspaces
  FOR UPDATE 
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Add comment explaining the security measure
COMMENT ON TRIGGER restrict_workspace_sensitive_updates ON workspaces IS 
  'Prevents direct updates to subscription_tier, subscription_status, max_members, stripe_customer_id, and grace_period_ends_at. These fields can only be updated via Stripe webhooks using service role.';
