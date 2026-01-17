-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_cron extension (for scheduled timeout checks)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'solo', 'agency')),
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'past_due')),
  slack_webhook_url TEXT,
  discord_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitors table
CREATE TABLE IF NOT EXISTS monitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  slug TEXT NOT NULL UNIQUE,
  expected_interval_seconds INTEGER NOT NULL CHECK (expected_interval_seconds >= 60),
  grace_period_seconds INTEGER NOT NULL DEFAULT 3600 CHECK (grace_period_seconds >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'healthy', 'late', 'failed')),
  last_ping_at TIMESTAMP WITH TIME ZONE,
  next_expected_ping_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pings table (stores last 50-100 pings per monitor)
CREATE TABLE IF NOT EXISTS pings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'fail')),
  message TEXT CHECK (char_length(message) <= 255),
  duration_ms INTEGER,
  metadata JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table (audit log of sent alerts)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('missing', 'failed', 'recovered')),
  channels TEXT[] NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_next_expected_ping_at ON monitors(next_expected_ping_at) WHERE status != 'late';
CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(status);
CREATE INDEX IF NOT EXISTS idx_pings_monitor_id ON pings(monitor_id);
CREATE INDEX IF NOT EXISTS idx_pings_received_at ON pings(received_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON monitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Monitors: Users can only see/edit their own monitors
CREATE POLICY "Users can view own monitors" ON monitors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitors" ON monitors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitors" ON monitors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitors" ON monitors
  FOR DELETE USING (auth.uid() = user_id);

-- Pings: Users can only see pings for their monitors
CREATE POLICY "Users can view pings for own monitors" ON pings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors 
      WHERE monitors.id = pings.monitor_id 
      AND monitors.user_id = auth.uid()
    )
  );

-- Allow service role to insert pings (for API endpoint)
CREATE POLICY "Service role can insert pings" ON pings
  FOR INSERT WITH CHECK (true);

-- Alerts: Users can only see alerts for their monitors
CREATE POLICY "Users can view alerts for own monitors" ON alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors 
      WHERE monitors.id = alerts.monitor_id 
      AND monitors.user_id = auth.uid()
    )
  );

-- Allow service role to insert alerts (for worker)
CREATE POLICY "Service role can insert alerts" ON alerts
  FOR INSERT WITH CHECK (true);

