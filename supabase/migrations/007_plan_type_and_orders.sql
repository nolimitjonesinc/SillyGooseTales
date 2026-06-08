-- Migration 007: Track plan type per subscriber + store LemonSqueezy order history
-- Required for revenue panel in admin dashboard

-- Add plan_type to subscribers (populated by checkout + webhook going forward)
ALTER TABLE sillytales_subscribers
  ADD COLUMN IF NOT EXISTS plan_type text CHECK (plan_type IN ('monthly', 'annual'));

-- Orders table: one row per successful LemonSqueezy order
-- Used to calculate real revenue in admin dashboard
CREATE TABLE IF NOT EXISTS sillytales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES sillytales_subscribers(id) ON DELETE SET NULL,
  lemonsqueezy_order_id text UNIQUE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON sillytales_orders TO service_role;
ALTER TABLE sillytales_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access_orders" ON sillytales_orders FOR ALL TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_subscriber ON sillytales_orders (subscriber_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created ON sillytales_orders (created_at DESC);
