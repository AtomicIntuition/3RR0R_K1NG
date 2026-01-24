-- Add LLM report column for AI-ready fix instructions
ALTER TABLE scans ADD COLUMN IF NOT EXISTS llm_report TEXT;

-- Add comment for documentation
COMMENT ON COLUMN scans.llm_report IS 'LLM-ready detailed report with CSS selectors and fix instructions for AI assistants';
