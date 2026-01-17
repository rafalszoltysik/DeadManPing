-- Update profiles table to work with custom auth (remove dependency on auth.users)
-- First, drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add email_verified column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Update the id column to be a regular UUID (not referencing auth.users)
-- Note: This will work with our custom auth system where we generate UUIDs ourselves

