-- Migration 009: Add progress tracking and roast personas
-- Fixes progress bar jumping and enables user-selectable roast personas

-- Add current_phase for accurate progress tracking
ALTER TABLE scans ADD COLUMN IF NOT EXISTS current_phase TEXT;

-- Add completed_phases to track which audits are done (JSON array)
ALTER TABLE scans ADD COLUMN IF NOT EXISTS completed_phases JSONB DEFAULT '[]'::jsonb;

-- Add roast_persona for user-selectable roast styles
ALTER TABLE scans ADD COLUMN IF NOT EXISTS roast_persona TEXT DEFAULT 'hacker';

-- Add twitter_roast for short-form shareable roast
ALTER TABLE scans ADD COLUMN IF NOT EXISTS twitter_roast TEXT;

-- Add twitter_image_url for the generated shareable image
ALTER TABLE scans ADD COLUMN IF NOT EXISTS twitter_image_url TEXT;

-- Create index on completed_phases for faster queries
CREATE INDEX IF NOT EXISTS idx_scans_current_phase ON scans(current_phase);

-- Add comment for documentation
COMMENT ON COLUMN scans.current_phase IS 'Current audit phase being executed';
COMMENT ON COLUMN scans.completed_phases IS 'Array of completed audit phase names';
COMMENT ON COLUMN scans.roast_persona IS 'User-selected roast persona: hacker, gordon, parent, interviewer, drill, meme, therapist';
COMMENT ON COLUMN scans.twitter_roast IS 'Short 280-char roast for Twitter sharing';
COMMENT ON COLUMN scans.twitter_image_url IS 'URL to generated shareable image';
