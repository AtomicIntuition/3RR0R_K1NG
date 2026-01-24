-- Phase 1 Audit Enhancement: New audit result columns
-- Adds columns for: vulnerabilities, protocol, images, caching, redirects

-- Add new audit result columns to scans table
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS results_vulnerabilities jsonb,
ADD COLUMN IF NOT EXISTS results_protocol jsonb,
ADD COLUMN IF NOT EXISTS results_images jsonb,
ADD COLUMN IF NOT EXISTS results_caching jsonb,
ADD COLUMN IF NOT EXISTS results_redirects jsonb;

-- Add indexes for common query patterns on new columns
CREATE INDEX IF NOT EXISTS idx_scans_results_vulnerabilities
ON scans USING GIN (results_vulnerabilities);

CREATE INDEX IF NOT EXISTS idx_scans_results_protocol
ON scans USING GIN (results_protocol);

COMMENT ON COLUMN scans.results_vulnerabilities IS 'Vulnerable JavaScript library detection results';
COMMENT ON COLUMN scans.results_protocol IS 'HTTP/2, HTTP/3 protocol detection results';
COMMENT ON COLUMN scans.results_images IS 'Image optimization audit results';
COMMENT ON COLUMN scans.results_caching IS 'Cache headers analysis results';
COMMENT ON COLUMN scans.results_redirects IS 'Redirect chain analysis results';
