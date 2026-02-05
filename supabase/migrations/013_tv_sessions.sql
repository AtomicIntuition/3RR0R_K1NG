-- TV Sessions table for pairing code authentication
CREATE TABLE IF NOT EXISTS tv_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast code lookups during pairing
CREATE INDEX idx_tv_sessions_code ON tv_sessions (code) WHERE status = 'pending';

-- Index for session polling
CREATE INDEX idx_tv_sessions_status ON tv_sessions (id, status);

-- Auto-expire old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_tv_sessions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM tv_sessions WHERE expires_at < NOW() AND status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_tv_sessions
  AFTER INSERT ON tv_sessions
  EXECUTE FUNCTION cleanup_expired_tv_sessions();

-- RLS policies
ALTER TABLE tv_sessions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (API routes use service client)
CREATE POLICY "Service role full access" ON tv_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
