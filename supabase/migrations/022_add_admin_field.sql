-- Migration: Add Admin Field to Profiles
-- Adds is_admin boolean field to profiles table for admin portal access control

-- Add is_admin column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Add index for efficient admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_admin IS 'Indicates if user has admin access to admin portal';


