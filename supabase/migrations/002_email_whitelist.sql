-- Email Whitelist for Giveaways
-- Run this migration in Supabase SQL Editor

-- Email whitelist table
CREATE TABLE IF NOT EXISTS email_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  granted_tier user_tier NOT NULL DEFAULT 'pro',
  expires_at TIMESTAMPTZ, -- NULL means never expires
  note TEXT, -- Optional note about why they were whitelisted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ -- When the user actually signed up
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_email_whitelist_email ON email_whitelist(email);

-- RLS for whitelist table
ALTER TABLE email_whitelist ENABLE ROW LEVEL SECURITY;

-- Only service role can access whitelist
CREATE POLICY "Service role full access to email_whitelist"
  ON email_whitelist FOR ALL
  USING (auth.role() = 'service_role');

-- Update the handle_new_user function to check whitelist
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  whitelist_record RECORD;
  assigned_tier user_tier;
BEGIN
  -- Check if email is whitelisted
  SELECT * INTO whitelist_record
  FROM email_whitelist
  WHERE email = LOWER(NEW.email)
    AND (expires_at IS NULL OR expires_at > NOW())
    AND used_at IS NULL;

  -- Determine tier based on whitelist
  IF whitelist_record IS NOT NULL THEN
    assigned_tier := whitelist_record.granted_tier;

    -- Mark whitelist entry as used
    UPDATE email_whitelist
    SET used_at = NOW()
    WHERE id = whitelist_record.id;
  ELSE
    assigned_tier := 'free';
  END IF;

  -- Create the profile with appropriate tier
  INSERT INTO profiles (id, email, tier)
  VALUES (NEW.id, NEW.email, assigned_tier);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on_auth_user_created already exists and will use the updated function
