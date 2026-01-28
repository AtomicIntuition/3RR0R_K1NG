-- Monitored sites for Pro users
CREATE TABLE monitored_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  name TEXT, -- optional friendly name
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,

  -- Last scan info
  last_scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  last_score INTEGER,
  last_grade TEXT,
  last_scanned_at TIMESTAMPTZ,

  -- Alert settings
  alert_on_drop BOOLEAN DEFAULT true,
  alert_threshold INTEGER DEFAULT 10, -- alert if score drops by this much

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  next_scan_at TIMESTAMPTZ DEFAULT NOW(), -- when to scan next

  -- Prevent duplicate URLs per user
  UNIQUE(user_id, url)
);

-- Indexes
CREATE INDEX idx_monitored_sites_user ON monitored_sites(user_id);
CREATE INDEX idx_monitored_sites_next_scan ON monitored_sites(next_scan_at) WHERE is_active = true;
CREATE INDEX idx_monitored_sites_active ON monitored_sites(user_id, is_active) WHERE is_active = true;

-- RLS policies
ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;

-- Users can view their own monitored sites
CREATE POLICY "Users can view own monitored sites"
  ON monitored_sites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own monitored sites
CREATE POLICY "Users can insert own monitored sites"
  ON monitored_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own monitored sites
CREATE POLICY "Users can update own monitored sites"
  ON monitored_sites FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own monitored sites
CREATE POLICY "Users can delete own monitored sites"
  ON monitored_sites FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monitored_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_monitored_sites_updated_at
  BEFORE UPDATE ON monitored_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_monitored_sites_updated_at();

-- Add monitoring columns to scans table (after monitored_sites table exists)
ALTER TABLE scans ADD COLUMN IF NOT EXISTS is_monitored_scan BOOLEAN DEFAULT false;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS monitored_site_id UUID REFERENCES monitored_sites(id) ON DELETE SET NULL;

-- Index for finding monitored scans
CREATE INDEX IF NOT EXISTS idx_scans_monitored ON scans(monitored_site_id) WHERE monitored_site_id IS NOT NULL;

-- Alert history (for tracking sent alerts)
CREATE TABLE monitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitored_site_id UUID REFERENCES monitored_sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,

  old_score INTEGER,
  new_score INTEGER,
  score_change INTEGER,

  alert_type TEXT DEFAULT 'score_drop' CHECK (alert_type IN ('score_drop', 'score_improve', 'site_down')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monitor_alerts_user ON monitor_alerts(user_id);
CREATE INDEX idx_monitor_alerts_site ON monitor_alerts(monitored_site_id);

-- RLS for alerts
ALTER TABLE monitor_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON monitor_alerts FOR SELECT
  USING (auth.uid() = user_id);
