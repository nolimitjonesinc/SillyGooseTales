# Phase 1 — Skeleton + Payments

**Goal:** A parent can sign up, pay $9.99, and see their dashboard. No stories yet.
**Prerequisite:** Phase 0 complete — test email confirmed in Gmail Primary.

---

## Tasks

### Project Setup
- [ ] Create Next.js 15 project: `npx create-next-app@latest story-drop --typescript --tailwind --app`
- [ ] Install shadcn/ui: `npx shadcn@latest init`
- [ ] Install dependencies: `@supabase/supabase-js`, `stripe`, `resend`, `@anthropic-ai/sdk`, `date-fns-tz`
- [ ] Create `.env.local` with all environment variables (see CLAUDE.md for full list)
- [ ] Deploy to Vercel, connect domain

### Supabase Setup
- [ ] Create Supabase project
- [ ] Write migration: `storydrop_subscribers` table with RLS + explicit GRANTs
- [ ] Write migration: `storydrop_preferences` table (include `character_state` jsonb column now — don't retrofit later) with RLS + explicit GRANTs
- [ ] Write migration: `storydrop_story_queue` table with RLS + explicit GRANTs
- [ ] Write migration: `storydrop_delivery_log` table with RLS + explicit GRANTs
- [ ] Verify all tables visible in Supabase Table Editor (if invisible, GRANTs are missing)
- [ ] Set RLS policies: subscribers read/write own rows only; is_admin bypass for admin page

### Stripe Integration
- [ ] Create Stripe products: Monthly ($9.99) and Annual ($89.99)
- [ ] Build `/api/checkout` — creates Stripe checkout session, redirects to Stripe hosted page
- [ ] Build `/api/webhooks/stripe` — handles `subscription.created`, `subscription.cancelled`, `subscription.updated`, `invoice.payment_failed`
- [ ] Webhook handler writes to Supabase ONLY — no heavy work, no story generation here
- [ ] Test: subscribe with Stripe test card `4242 4242 4242 4242`, verify subscriber row appears in Supabase

### Email Verification
- [ ] Build double opt-in flow via Resend — confirmation email sent on signup, subscriber confirmed before any story generates
- [ ] Confirmation link creates subscriber row in Supabase with `subscription_status: free_trial`

### Basic Dashboard
- [ ] Build `/dashboard` — protected by Supabase auth (magic link login)
- [ ] Show: subscription status (active/paused/free), next delivery date, child name
- [ ] Show: "Pause stories" button (sets `subscription_status: paused`)
- [ ] Show: "Resume stories" button
- [ ] Show: Stripe Customer Portal link for self-serve cancellation/billing changes

---

## Done When

A real credit card charges $9.99. The subscriber row appears in Supabase with `subscription_status: active`.
