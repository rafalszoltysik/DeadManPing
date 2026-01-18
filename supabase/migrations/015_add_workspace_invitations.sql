-- Migration: Add support for workspace invitations
-- Allows inviting users who don't have accounts yet via Supabase Auth invite emails

-- Step 1: Make user_id nullable (for pending invitations)
ALTER TABLE workspace_members
  ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Add invite_email column for pending invitations
ALTER TABLE workspace_members
  ADD COLUMN IF NOT EXISTS invite_email TEXT;

-- Step 3: Add status column to track invitation state
ALTER TABLE workspace_members
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted'));

-- Step 4: Update unique constraint to handle both user_id and invite_email
-- Drop existing constraint
ALTER TABLE workspace_members
  DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_user_id_key;

-- Add new constraint: unique per workspace for user_id OR invite_email
-- This allows one pending invitation per email per workspace
CREATE UNIQUE INDEX IF NOT EXISTS workspace_members_workspace_id_user_id_unique
  ON workspace_members(workspace_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS workspace_members_workspace_id_invite_email_unique
  ON workspace_members(workspace_id, invite_email)
  WHERE invite_email IS NOT NULL;

-- Step 5: Add constraint to ensure either user_id or invite_email is set
ALTER TABLE workspace_members
  ADD CONSTRAINT workspace_members_user_or_email_check
  CHECK (
    (user_id IS NOT NULL AND invite_email IS NULL) OR
    (user_id IS NULL AND invite_email IS NOT NULL)
  );

-- Step 6: Update existing records to have status 'accepted' (they already have user_id)
UPDATE workspace_members
SET status = 'accepted'
WHERE status IS NULL AND user_id IS NOT NULL;

-- Step 7: Add index for faster lookups by invite_email
CREATE INDEX IF NOT EXISTS idx_workspace_members_invite_email ON workspace_members(invite_email);

-- Step 8: Add index for status lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON workspace_members(status);

