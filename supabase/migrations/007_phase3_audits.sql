-- Phase 3: Add PWA, Structured Data, and Link Audit columns to scans table

-- Add Phase 3 audit result columns
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS results_pwa jsonb,
ADD COLUMN IF NOT EXISTS results_structured_data jsonb,
ADD COLUMN IF NOT EXISTS results_links jsonb;

-- Add indexes for filtering on new columns
CREATE INDEX IF NOT EXISTS idx_scans_pwa_installable ON scans ((results_pwa->>'installable')) WHERE results_pwa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scans_structured_data_found ON scans ((results_structured_data->>'found')) WHERE results_structured_data IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN scans.results_pwa IS 'PWA audit results: manifest, service worker, icons, installability';
COMMENT ON COLUMN scans.results_structured_data IS 'Structured data audit results: JSON-LD, microdata, schema.org types';
COMMENT ON COLUMN scans.results_links IS 'Link audit results: broken links, redirects, insecure HTTP links';
