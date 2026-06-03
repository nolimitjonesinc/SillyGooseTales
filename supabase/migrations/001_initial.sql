-- Story Drop: Initial Schema
-- CRITICAL: All tables need explicit GRANTs or PostgREST returns silent permission denied
-- Pattern stolen from Loomiverse-Online CLAUDE.md

-- =====================================================
-- SUBSCRIBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS storydrop_subscribers (
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

GRANT SELECT ON storydrop_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_subscribers TO service_role;

ALTER TABLE storydrop_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscribers_own_row" ON storydrop_subscribers
  FOR ALL TO authenticated
  USING (id = auth.uid());

CREATE POLICY "service_role_full_access_subscribers" ON storydrop_subscribers
  FOR ALL TO service_role USING (true);

-- =====================================================
-- PREFERENCES
-- =====================================================
CREATE TABLE IF NOT EXISTS storydrop_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES storydrop_subscribers(id) ON DELETE CASCADE,
  child_name text NOT NULL,
  child_age int NOT NULL CHECK (child_age BETWEEN 3 AND 10),
  interests text[] NOT NULL DEFAULT '{}',
  themes_include text[] NOT NULL DEFAULT '{}',
  themes_exclude text[] NOT NULL DEFAULT '{}',
  tone_profile text NOT NULL DEFAULT 'cozy_bedtime',
  delivery_day text NOT NULL DEFAULT 'friday',
  delivery_slot text NOT NULL DEFAULT 'evening'
    CHECK (delivery_slot IN ('morning', 'afternoon', 'evening')),
  timezone text NOT NULL DEFAULT 'America/New_York',
  story_history text[] NOT NULL DEFAULT '{}',
  -- character_state column exists from day 1 — serialization ships Month 4
  character_state jsonb DEFAULT NULL,
  next_delivery_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON storydrop_preferences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_preferences TO service_role;

ALTER TABLE storydrop_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preferences_own_row" ON storydrop_preferences
  FOR ALL TO authenticated
  USING (subscriber_id = auth.uid());

CREATE POLICY "service_role_full_access_preferences" ON storydrop_preferences
  FOR ALL TO service_role USING (true);

-- =====================================================
-- STORY QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS storydrop_story_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES storydrop_subscribers(id) ON DELETE CASCADE,
  story_title text NOT NULL,
  story_body text NOT NULL,
  delivery_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'delivered', 'failed', 'flagged')),
  retry_count int NOT NULL DEFAULT 0,
  qc_score jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT ON storydrop_story_queue TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_story_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_story_queue TO service_role;

ALTER TABLE storydrop_story_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "queue_own_row" ON storydrop_story_queue
  FOR SELECT TO authenticated
  USING (subscriber_id = auth.uid());

CREATE POLICY "service_role_full_access_queue" ON storydrop_story_queue
  FOR ALL TO service_role USING (true);

-- =====================================================
-- DELIVERY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS storydrop_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES storydrop_subscribers(id) ON DELETE CASCADE,
  story_queue_id uuid REFERENCES storydrop_story_queue(id) ON DELETE SET NULL,
  story_title text,
  delivered_at timestamptz,
  resend_message_id text,
  status text NOT NULL DEFAULT 'delivered'
    CHECK (status IN ('delivered', 'bounced', 'failed', 'complained')),
  email_opened boolean NOT NULL DEFAULT false,
  opened_at timestamptz,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT ON storydrop_delivery_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_delivery_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storydrop_delivery_log TO service_role;

ALTER TABLE storydrop_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "log_own_row" ON storydrop_delivery_log
  FOR SELECT TO authenticated
  USING (subscriber_id = auth.uid());

CREATE POLICY "service_role_full_access_log" ON storydrop_delivery_log
  FOR ALL TO service_role USING (true);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_story_queue_delivery ON storydrop_story_queue (delivery_at, status);
CREATE INDEX IF NOT EXISTS idx_story_queue_subscriber ON storydrop_story_queue (subscriber_id, status);
CREATE INDEX IF NOT EXISTS idx_preferences_subscriber ON storydrop_preferences (subscriber_id);
CREATE INDEX IF NOT EXISTS idx_delivery_log_subscriber ON storydrop_delivery_log (subscriber_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_magic_token ON storydrop_subscribers (magic_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe ON storydrop_subscribers (stripe_subscription_id);
