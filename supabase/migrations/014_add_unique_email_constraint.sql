-- Migration: Add unique constraint on email in profiles table
-- Prevents duplicate accounts with the same email address

-- First, clean up any duplicate emails (keep the oldest one)
-- This will handle existing duplicates before adding the constraint
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  FOR duplicate_record IN 
    SELECT email, array_agg(id ORDER BY created_at) as ids
    FROM profiles
    GROUP BY email
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first (oldest) profile, delete the rest
    DELETE FROM profiles
    WHERE email = duplicate_record.email
    AND id != duplicate_record.ids[1];
    
    RAISE NOTICE 'Removed duplicate profiles for email: %, kept profile: %', 
      duplicate_record.email, duplicate_record.ids[1];
  END LOOP;
END $$;

-- Add unique constraint on email (case-insensitive)
-- This ensures that "User@Example.com" and "user@example.com" are treated as the same email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(LOWER(TRIM(email)));

-- Also normalize existing emails to lowercase
UPDATE profiles SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));

