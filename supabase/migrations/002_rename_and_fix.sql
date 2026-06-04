-- Migration 002: Rename storydrop_ → sillytales_ + fix age constraint + add mood column
-- Run this in Supabase SQL Editor → New Query → paste → Run

-- =====================================================
-- RENAME TABLES (only if they exist with old name)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storydrop_subscribers') THEN
    ALTER TABLE storydrop_subscribers RENAME TO sillytales_subscribers;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storydrop_preferences') THEN
    ALTER TABLE storydrop_preferences RENAME TO sillytales_preferences;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storydrop_story_queue') THEN
    ALTER TABLE storydrop_story_queue RENAME TO sillytales_story_queue;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storydrop_delivery_log') THEN
    ALTER TABLE storydrop_delivery_log RENAME TO sillytales_delivery_log;
  END IF;
END $$;

-- =====================================================
-- CREATE TABLES IF THEY STILL DON'T EXIST
-- (handles case where migration 001 was never run)
-- =====================================================
CREATE TABLE IF NOT EXISTS sillytales_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text NOT NULL DEFAULT 'free_trial'
    CHECK (subscription_status IN ('free_trial', 'active', 'paused', 'at_risk', 're_engagement_paused', 'churned', 'cancelled')),
  is_admin boolean NOT NULL DEFAULT false,
  magic_token uuid,
  magic_token_expires_at timestamptz,
  consecutive_unopened_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sillytales_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES sillytales_subscribers(id) ON DELETE CASCADE,
  child_name text NOT NULL,
  child_age int NOT NULL CHECK (child_age BETWEEN 2 AND 12),
  interests text[] NOT NULL DEFAULT '{}',
  themes_include text[] NOT NULL DEFAULT '{}',
  themes_exclude text[] NOT NULL DEFAULT '{}',
  tone_profile text NOT NULL DEFAULT 'cozy_bedtime',
  mood text DEFAULT NULL,
  delivery_day text NOT NULL DEFAULT 'friday',
  delivery_slot text NOT NULL DEFAULT 'evening'
    CHECK (delivery_slot IN ('morning', 'afternoon', 'evening')),
  timezone text NOT NULL DEFAULT 'America/New_York',
  story_history text[] NOT NULL DEFAULT '{}',
  character_state jsonb DEFAULT NULL,
  next_delivery_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sillytales_story_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES sillytales_subscribers(id) ON DELETE CASCADE,
  story_title text NOT NULL,
  story_body text NOT NULL,
  delivery_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'delivered', 'failed', 'flagged')),
  retry_count int NOT NULL DEFAULT 0,
  qc_score jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sillytales_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES sillytales_subscribers(id) ON DELETE CASCADE,
  story_queue_id uuid REFERENCES sillytales_story_queue(id) ON DELETE SET NULL,
  story_title text,
  delivered_at timestamptz,
  resend_message_id text,
  status text NOT NULL DEFAULT 'delivered'
    CHECK (status IN ('delivered', 'bounced', 'failed', 'complained')),
  email_opened boolean NOT NULL DEFAULT false,
  opened_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- FIX AGE CONSTRAINT (drop old 3-10 limit, allow 2-12)
-- =====================================================
ALTER TABLE sillytales_preferences
  DROP CONSTRAINT IF EXISTS storydrop_preferences_child_age_check,
  DROP CONSTRAINT IF EXISTS sillytales_preferences_child_age_check;

ALTER TABLE sillytales_preferences
  ADD CONSTRAINT sillytales_preferences_child_age_check CHECK (child_age BETWEEN 2 AND 12);

-- =====================================================
-- ADD MOOD COLUMN IF MISSING
-- =====================================================
ALTER TABLE sillytales_preferences
  ADD COLUMN IF NOT EXISTS mood text DEFAULT NULL;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON sillytales_subscribers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON sillytales_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON sillytales_story_queue TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON sillytales_delivery_log TO service_role;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE sillytales_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sillytales_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sillytales_story_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sillytales_delivery_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_subscribers" ON sillytales_subscribers;
CREATE POLICY "service_role_full_access_subscribers" ON sillytales_subscribers
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "service_role_full_access_preferences" ON sillytales_preferences;
CREATE POLICY "service_role_full_access_preferences" ON sillytales_preferences
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "service_role_full_access_queue" ON sillytales_story_queue;
CREATE POLICY "service_role_full_access_queue" ON sillytales_story_queue
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "service_role_full_access_log" ON sillytales_delivery_log;
CREATE POLICY "service_role_full_access_log" ON sillytales_delivery_log
  FOR ALL TO service_role USING (true);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sillytales_queue_delivery ON sillytales_story_queue (delivery_at, status);
CREATE INDEX IF NOT EXISTS idx_sillytales_queue_subscriber ON sillytales_story_queue (subscriber_id, status);
CREATE INDEX IF NOT EXISTS idx_sillytales_prefs_subscriber ON sillytales_preferences (subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sillytales_log_subscriber ON sillytales_delivery_log (subscriber_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sillytales_magic_token ON sillytales_subscribers (magic_token);
