-- Add scan_credits column to profiles for tracking purchased scan packs
-- Run this migration in Supabase SQL Editor

-- Add scan_credits column (for purchased scan packs, never expires)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS scan_credits INTEGER DEFAULT 0;

-- Add columns for daily scan tracking (free users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS scans_today INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_scan_date DATE DEFAULT CURRENT_DATE;

-- Add monthly scan tracking (pro users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS scans_this_month INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS billing_cycle_start DATE;

-- Create function to reset daily scans
CREATE OR REPLACE FUNCTION reset_daily_scans()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_scan_date <> CURRENT_DATE THEN
    NEW.scans_today := 0;
    NEW.last_scan_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset daily scans on profile access
DROP TRIGGER IF EXISTS reset_daily_scans_trigger ON profiles;
CREATE TRIGGER reset_daily_scans_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_scans();

-- Add index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- Comment on columns for documentation
COMMENT ON COLUMN profiles.scan_credits IS 'Purchased scan credits from scan packs (never expire)';
COMMENT ON COLUMN profiles.scans_today IS 'Number of scans used today (resets daily for free users)';
COMMENT ON COLUMN profiles.scans_this_month IS 'Number of scans used this billing cycle (for pro users)';
COMMENT ON COLUMN profiles.billing_cycle_start IS 'Start date of current billing cycle (for pro users)';
