# Phase 3 — Story Generation + QC + Delivery Pipeline

**Goal:** End-to-end automated pipeline. Story generates, passes QC, queues, and delivers to a real inbox at the correct local time.
**Prerequisite:** Phase 2 complete — onboarding working, preferences in Supabase.

---

## Tasks

### Story Generation Endpoint
- [ ] Build `src/lib/story-generator.ts` — assembles the 5-layer prompt from subscriber preferences
  - Layer 1: static identity lock (in `docs/story-spec.md`)
  - Layer 2: tone profile snippet (from `src/lib/story-tones.js`)
  - Layer 3: personalization block (from preferences row — child name, age, interests, story_history, character_state)
  - Layer 4: structure directive (static per age band — word count ceiling as hard constraint)
  - Layer 5: quality constraints (static, appended LAST)
- [ ] Call Claude Haiku 3.5 (`claude-haiku-3-5-20241022`) with assembled prompt
- [ ] Extract story title from response (first line, or instruct Claude to output title on line 1)
- [ ] Return: `{ title, body, token_count }`

### QC Scoring
- [ ] Build `src/lib/qc-scorer.ts` — scores a story against 5 criteria using a separate Claude Haiku call
- [ ] QC prompt checks: protagonist drives resolution / interest is load-bearing / no explicit moral / word count in range / tone matches profile
- [ ] Returns: `{ passed: boolean, scores: { protagonist: bool, interest: bool, no_moral: bool, word_count: bool, tone: bool }, notes: string }`
- [ ] If any score is false → `passed: false`

### Story Queue API
- [ ] Build `/api/generate-story` — takes subscriber_id, generates story, runs QC, saves to `storydrop_story_queue`
  - If QC passes: insert row with `status: queued` and `delivery_at` UTC timestamp
  - If QC fails: regenerate up to 2 times
  - If still failing after 2 retries: insert with `status: flagged`, send admin alert email via Resend
- [ ] `delivery_at` calculation: use `date-fns-tz` to convert subscriber's IANA timezone + delivery slot to UTC

### Generation Cron
- [ ] Build `/api/queue-stories` — Vercel Cron endpoint, fires daily at 6am UTC
  - Query `storydrop_preferences` for subscribers with next_delivery_at falling in the next 24 hours
  - For each: call `/api/generate-story`
  - Respect `STORYDROP_DRY_RUN` env var — if true, log but don't insert to queue
- [ ] Add to `vercel.json`: `{ "crons": [{ "path": "/api/queue-stories", "schedule": "0 6 * * *" }] }`

### Delivery Cron
- [ ] Build `/api/deliver-stories` — Vercel Cron endpoint, fires every 5 minutes
  - STEALING FROM MOCKINGBIRD: port `getNextQueueItem()` logic — query `storydrop_story_queue` WHERE `delivery_at <= now()` AND `status = 'queued'`
  - For each due story: send via Resend, mark `status: delivered`, insert to `storydrop_delivery_log`
  - On Resend failure: increment `retry_count`, mark `status: failed` if `retry_count >= 3`, send admin alert
  - Respect `STORYDROP_DRY_RUN` env var
- [ ] Add to `vercel.json`: `{ "path": "/api/deliver-stories", "schedule": "*/5 * * * *" }`

### Story History Tracking
- [ ] After successful delivery, append story title to subscriber's `story_history` array in `storydrop_preferences`
- [ ] Keep last 10 only — trim array if length > 10
- [ ] This list is injected into Layer 3 personalization as "avoided plot structures" on next generation

### QC Sampling Review
- [ ] Build `/admin/review` page — protected by Supabase is_admin RLS bypass
  - Shows: stories flagged after 2 failed QC attempts
  - Shows: 1 random story per 100 delivered (random sample for spot-check)
  - Each story shows: child age, tone profile, interests, QC score breakdown, full story text
  - "Looks good" button — marks reviewed, clears from queue
  - "Regenerate" button — triggers new generation for that subscriber
- [ ] This page ships with Phase 3. Not Phase 4.

### Weekly Health Digest
- [ ] Build `/api/health-digest` — Vercel Cron endpoint, fires Monday 8am UTC
  - Pulls from `storydrop_delivery_log`: delivery success rate past 7 days
  - Pulls from `storydrop_story_queue`: stories flagged (QC failed 2x)
  - Pulls from `storydrop_subscribers`: subscriber count, week-over-week change
  - Sends summary email to `nolimitjones@gmail.com` via Resend
  - Format: 5 bullets, plain text, subject: "Story Drop — Weekly Health [date]"
- [ ] Add to `vercel.json`: `{ "path": "/api/health-digest", "schedule": "0 8 * * 1" }`

### Churn Early Warning
- [ ] Build query in health digest: subscribers with 0 email opens in last 3 deliveries (use Resend webhook data)
- [ ] For these subscribers: queue a re-engagement story with a different tone profile than their default
- [ ] If still no open after 2 more deliveries: pause delivery, send "still want stories?" email

### Resend Webhooks
- [ ] Build `/api/webhooks/resend` — handles Resend email events
  - `email.opened` → update delivery_log, track engagement
  - `email.bounced` → mark subscriber email invalid, pause delivery
  - `email.complained` → immediately unsubscribe, delete from queue

---

### Story Page + PDF

- [x] Migration 003 — add `story_token` (uuid, unique) and `illustration_url` to `sillytales_story_queue`
- [x] Build `/story/[token]` — public server-rendered story page (no login, secret URL)
  - Illustration at top (renders when `illustration_url` is present)
  - Full story in Georgia serif, amber title, warm off-white background
  - "Save as PDF" button (top-right, hidden on print, uses window.print())
  - Upsell section (free users only) — annual card dominant, links to Stripe checkout
- [x] Update `emails/StoryEmail.tsx` — teaser format (title + 2 paragraphs + CTA button → story page)
- [x] Update `deliver-stories` — builds story page URL from token, passes teaser to email
- [x] Update `generate-story` — generates and stores `story_token` on queue insert
- [ ] Image generation — DALL-E 3 integration, build prompt from story scene + Version B style formula

---

## Done When

A story generates automatically, passes QC, enters the queue, and arrives in a real Gmail Primary inbox at the correct local time with the child's name in the subject line. The admin review page is live. The weekly health digest fires on Monday.
