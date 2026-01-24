-- Phase 2: File Upload & Code Analysis
-- Adds support for uploading code files for analysis (ZIP, package.json, etc.)

-- Add scan_type to distinguish between URL scans and file uploads
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS scan_type text DEFAULT 'url' CHECK (scan_type IN ('url', 'upload'));

-- Add uploaded_files metadata (stores file paths and sizes)
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS uploaded_files jsonb;

-- Add new Phase 2 audit result columns
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS results_dependencies jsonb,
ADD COLUMN IF NOT EXISTS results_secrets jsonb,
ADD COLUMN IF NOT EXISTS results_code_patterns jsonb;

-- Create table for storing uploaded file metadata
CREATE TABLE IF NOT EXISTS scan_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  file_hash text,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_scans_scan_type
ON scans (scan_type);

CREATE INDEX IF NOT EXISTS idx_scans_results_dependencies
ON scans USING GIN (results_dependencies);

CREATE INDEX IF NOT EXISTS idx_scans_results_secrets
ON scans USING GIN (results_secrets);

CREATE INDEX IF NOT EXISTS idx_scans_results_code_patterns
ON scans USING GIN (results_code_patterns);

CREATE INDEX IF NOT EXISTS idx_scan_files_scan_id
ON scan_files (scan_id);

-- Add comments
COMMENT ON COLUMN scans.scan_type IS 'Type of scan: url (website) or upload (code files)';
COMMENT ON COLUMN scans.uploaded_files IS 'Metadata about uploaded files (path, size)';
COMMENT ON COLUMN scans.results_dependencies IS 'Package.json dependency vulnerability audit results';
COMMENT ON COLUMN scans.results_secrets IS 'Exposed secrets/credentials detection results';
COMMENT ON COLUMN scans.results_code_patterns IS 'Dangerous code pattern detection results';
COMMENT ON TABLE scan_files IS 'Stores metadata for files uploaded during code scans';
