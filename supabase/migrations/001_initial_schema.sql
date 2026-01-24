-- 3RROR_K1NG Database Schema
-- Run this migration in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for scan status
CREATE TYPE scan_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Enum for user tier
CREATE TYPE user_tier AS ENUM ('anonymous', 'free', 'pro');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier user_tier DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  scans_this_hour INTEGER DEFAULT 0,
  last_scan_reset TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  status scan_status DEFAULT 'pending',

  -- Individual category scores (0-100)
  score_overall INTEGER,
  score_performance INTEGER,
  score_security INTEGER,
  score_seo INTEGER,
  score_accessibility INTEGER,
  score_code_quality INTEGER,

  -- Detailed results stored as JSONB
  results_performance JSONB,
  results_security JSONB,
  results_seo JSONB,
  results_accessibility JSONB,
  results_code_quality JSONB,
  results_tech_stack JSONB,

  -- Roast content
  roast_title TEXT,
  roast_body TEXT,
  roast_fixes JSONB,

  -- Metadata
  screenshot_url TEXT,
  error_message TEXT,
  ip_address TEXT,
  fingerprint TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting table for anonymous users
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- IP + fingerprint hash
  scan_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for scans
CREATE POLICY "Anyone can view completed scans"
  ON scans FOR SELECT
  USING (status = 'completed');

CREATE POLICY "Users can view own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create scans"
  ON scans FOR INSERT
  WITH CHECK (true);

-- Service role can do everything (for worker)
CREATE POLICY "Service role full access to scans"
  ON scans FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to rate_limits"
  ON rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scans_updated_at
  BEFORE UPDATE ON scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
