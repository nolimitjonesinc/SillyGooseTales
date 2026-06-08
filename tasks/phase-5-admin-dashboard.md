# Phase 5 — Admin Dashboard

**Goal:** A single page at `/admin` that shows everything needed to run Silly Goose Tales without touching Supabase directly. Built for a non-technical founder — plain English labels, color-coded warnings, no jargon.

**Prerequisite:** Phase 3 pipeline running. Stories generating and delivering.

---

## Prerequisite: Token Tracking (must ship before the cost panel)

- [x] Add `input_tokens` (integer) and `output_tokens` (integer) columns to `sillytales_story_queue` — migration 006
- [x] Update `generateStory` in `lib/story-generator.ts` to return `usage.input_tokens` and `usage.output_tokens` from the Anthropic response
- [x] Update `app/api/generate-story/route.ts` to save those values when inserting into the queue
- [x] Add `cost_usd` as a calculated value on read (Haiku 3.5: $0.80/M input, $4.00/M output) — compute in the API, don't store
- [x] Also track QC scorer token usage (separate Haiku call) — `qc_input_tokens` and `qc_output_tokens` columns

---

## Section 1 — Overview Strip (extend existing)

- [x] Keep existing cards: Active subscribers, At-risk, Delivery success rate, Open rate, Queued, Flagged, Failures, Total
- [x] Add: Free trial count (separate from active/paid)
- [x] Add: Trial-to-paid conversion rate (paid ÷ total signups, as a %)
- [x] Rename labels to plain English — "Disengaged (3+ ignored)"
- [x] Color logic: amber warn on at-risk, failures, flagged

---

## Section 2 — Cost Panel (new)

- [x] Today's Claude API spend (sum of cost_usd for stories generated today)
- [x] This week's spend (rolling 7 days)
- [x] Projected monthly spend (weekly average × 4.3)
- [x] Average cost per story (all-time)
- [x] Total stories generated all-time
- [x] Cost per active subscriber per month (total monthly ÷ active count)

---

## Section 3 — Per-Subscriber Table (new)

- [x] Child's name + age (from preferences)
- [x] Status badge: Free Trial / Active / At Risk / Paused / Churned
- [x] Stories sent (all-time count from delivery log)
- [x] Total $ spent generating their stories (sum of cost_usd)
- [x] Last story date
- [x] Open rate (their stories opened ÷ delivered, as X/Y count)
- [x] "Send story now" button — calls `/api/generate-story` + `/api/deliver-stories` immediately
- [x] Sortable by: cost (most expensive first), stories sent, last active
- [x] Color-code at-risk rows in amber

---

## Section 4 — Pipeline Status (new)

- [x] Last time `queue-stories` cron ran (derived from most recent story_queue created_at)
- [x] Last time `deliver-stories` cron ran (derived from most recent delivery_log created_at)
- [x] Stories currently sitting in queue with their scheduled delivery time
- [x] Flagged count visible in overview strip
- [ ] Rate limit hits — skipped (would require new DB table; low value pre-launch — revisit at 50+ subscribers)

---

## Section 5 — Manual Controls (extend existing)

- [x] "Run delivery now" button — hits `/api/deliver-stories` and shows result inline
- [x] "Run story queue now" button — hits `/api/queue-stories`
- [x] "Run health digest" button
- [x] Per-subscriber "Send story now" (in subscriber table)
- [x] Buttons show a spinner while running and display success/fail inline — no page reload

---

## Section 6 — Revenue Panel (new)

- [x] MRR estimate (monthly subs × $9.99 + annual subs × $7.50/mo)
- [x] Monthly vs. annual subscriber counts
- [x] New paid subscribers this week (from orders table)
- [x] Total logged revenue (from sillytales_orders table)
- [x] Store LemonSqueezy order data in `sillytales_orders` — migration 007 + webhook updated
- [x] Track plan_type per subscriber — migration 007 + checkout + webhook updated
- [ ] Trial-to-paid conversion rate — visible in overview strip; detailed breakdown skipped (not enough data pre-launch)

---

## Section 7 — Flagged Story Review

- [x] Flagged story cards with inline state (replaces old /admin/review link)
- [x] "Regenerate" button — deletes flagged story, triggers fresh generation immediately
- [x] "Approve as-is" button — marks story as queued for delivery
- [x] QC checks shown in plain English labels

---

## What to Skip (for now)

- Charts and graphs — not enough data yet, add post-launch
- Email open rate trends over time — revisit at 50+ subscribers
- CSV export — add when someone actually asks for it
- Story content search — overkill pre-launch
- Rate limit hit tracking — add if needed post-launch

---

## Done When

You can open `/admin`, see at a glance if anything is broken, know exactly what the app is costing you per day, see every subscriber and their story history, and manually trigger a story for any user — all without opening Supabase or reading a single log.

**STATUS: COMPLETE** ✓ (2026-06-07)
