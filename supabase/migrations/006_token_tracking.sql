-- Migration 006: Track Claude API token usage per story
-- Enables cost analytics in admin dashboard
ALTER TABLE sillytales_story_queue
  ADD COLUMN IF NOT EXISTS input_tokens integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qc_input_tokens integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qc_output_tokens integer NOT NULL DEFAULT 0;
