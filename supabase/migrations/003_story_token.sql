-- Migration 003: Add story_token and illustration_url to story queue
-- story_token: the secret URL key for the public story page
-- illustration_url: optional DALL-E generated image stored in CDN

ALTER TABLE sillytales_story_queue
  ADD COLUMN IF NOT EXISTS story_token uuid UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS illustration_url text DEFAULT NULL;

-- Backfill existing rows that have NULL tokens
UPDATE sillytales_story_queue
  SET story_token = gen_random_uuid()
  WHERE story_token IS NULL;

-- Make it non-nullable going forward
ALTER TABLE sillytales_story_queue
  ALTER COLUMN story_token SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sillytales_queue_token ON sillytales_story_queue (story_token);
