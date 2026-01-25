-- Leads table for email capture (conversion funnel)
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'unknown', -- 'scan_gate', 'newsletter', 'exit_intent', etc.
  converted_at TIMESTAMPTZ, -- When they created an account
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Only service role can access leads
CREATE POLICY "Service role full access to leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to link lead to user on signup
CREATE OR REPLACE FUNCTION link_lead_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leads
  SET
    user_id = NEW.id,
    converted_at = NOW()
  WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

-- Trigger to link leads when user signs up
CREATE TRIGGER on_user_created_link_lead
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_lead_to_user();
