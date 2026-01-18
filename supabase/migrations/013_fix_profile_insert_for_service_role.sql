-- Migration: Fix profile insert for service role and add automatic profile creation trigger
-- Service role should be able to insert profiles (bypasses RLS automatically)
-- But we also need to ensure the INSERT policy works correctly

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate INSERT policy for users (when authenticated via Supabase auth)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Note: Service role automatically bypasses RLS, so it can insert profiles
-- without needing a specific policy. This policy is for regular authenticated users.

-- Create function to automatically create profile when user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, email_verified, subscription_tier, subscription_status)
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)), -- Normalize email to lowercase and trim
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    'free',
    'trialing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: This trigger ensures that every user created in auth.users automatically gets a profile
-- This is a backup in case the application-level profile creation fails

