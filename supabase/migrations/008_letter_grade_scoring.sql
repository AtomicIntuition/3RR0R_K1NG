-- Add letter grade and comprehensive scoring breakdown columns

-- Add letter grade column
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS letter_grade text;

-- Add scoring breakdown column (stores the full scoring analysis)
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS scoring_breakdown jsonb;

-- Add index for filtering by letter grade
CREATE INDEX IF NOT EXISTS idx_scans_letter_grade ON scans (letter_grade) WHERE letter_grade IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN scans.letter_grade IS 'Letter grade (A+ to F) based on comprehensive scoring';
COMMENT ON COLUMN scans.scoring_breakdown IS 'Detailed scoring breakdown by category with weights and contributions';
