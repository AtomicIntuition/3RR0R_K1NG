-- Add columns to track when AI roast generation falls back to template
-- This helps with debugging and monitoring AI reliability

ALTER TABLE scans
ADD COLUMN IF NOT EXISTS roast_is_fallback BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS roast_fallback_reason TEXT;

-- Create index for monitoring fallback rates
CREATE INDEX IF NOT EXISTS idx_scans_roast_fallback ON scans (roast_is_fallback) WHERE roast_is_fallback = TRUE;

COMMENT ON COLUMN scans.roast_is_fallback IS 'True if AI roast generation failed and used template fallback';
COMMENT ON COLUMN scans.roast_fallback_reason IS 'Reason for fallback (timeout, rate limit, parse error, etc.)';
