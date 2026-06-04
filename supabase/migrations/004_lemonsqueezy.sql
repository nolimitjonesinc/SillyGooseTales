alter table sillytales_subscribers
  add column if not exists lemonsqueezy_customer_id text,
  add column if not exists lemonsqueezy_subscription_id text;

create index if not exists idx_subscribers_ls
  on sillytales_subscribers (lemonsqueezy_subscription_id);
