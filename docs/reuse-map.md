# Story Drop — Reuse Map

Before writing any new code, check this file. If it's on this list, steal it — don't rebuild it.

---

## 1. Quiply → Tone Profile System

**Source:** `~/Desktop/Quiply-v1.0.6/personalities.js`

**What to steal:** The `{ id, name, description, prompt }` array architecture. Each personality is a named tone with a system prompt string. This is the exact pattern for Story Drop's tone profiles.

**How to adapt:**
- Copy the array structure 1:1 to `src/lib/story-tones.js`
- Remove `window.personalities` browser global
- Export as ES module: `export const STORY_TONES = [...]`
- Add `age_range` field alongside existing fields
- Rename `prompt` → `system_prompt_snippet`
- Replace the 12 Quiply personas with the 6 Story Drop tones

**Result:** `src/lib/story-tones.js` with 6 profiles: cozy_bedtime, grand_adventure, giggle_factory, brave_heart, magic_and_wonder, laugh_and_learn

---

## 2. Mockingbird News Bot → Queue + Cron Pipeline

**Source:** `~/Desktop/Mockingbird News Bot/promo-bot.js`

**What to steal:**
- `getNextQueueItem()` — filters queue for items with `scheduled_for <= now()`
- Post-send cleanup — remove item from queue after successful send (here: mark `status: delivered`)
- `--dry-run` flag pattern — `STORYDROP_DRY_RUN` env var instead of CLI flag
- Lock file pattern — not needed (Vercel Cron handles concurrency via single endpoint)

**How to adapt:**
- Move queue from `queue.json` (local file) to `storydrop_story_queue` Supabase table
- Replace Twitter API call with `resend.emails.send()`
- Replace `--post-one` CLI flag with Vercel Cron hitting `/api/deliver-stories` every 5 minutes
- `scheduled_for` → `delivery_at` (UTC timestamp in Supabase)

**Result:** `/api/queue-stories` (generation cron) + `/api/deliver-stories` (delivery cron)

---

## 3. Loomiverse — Story Generation Patterns

**Source:** `~/Desktop/Loomiverse-Online/src/lib/sleepStoryStorage.js`

**What to steal:**
- `buildSleepStoryPrompt()` pattern — how it assembles tone + length + settings into a system prompt
- `LENGTH_TIERS` object — `{ SHORT: { words: 300, maxTokens: 500 }, MEDIUM: {...}, FULL: {...} }` — maps directly to Story Drop age band word count specs
- `SLEEP_SETTINGS` array structure — `{ id, name, description, suggestedAnchor }` — same model as Story Drop's theme options

**How to adapt:**
- Strip streaming + TTS audio layers — Story Drop delivers finished text by email, not streamed to a browser
- Rename `SLEEP_SETTINGS` → `STORY_SETTINGS` with child-appropriate settings
- Replace `customAnchor` with `child_name + interests` from subscriber preferences
- Rename `LENGTH_TIERS` → `AGE_BAND_SPECS` with Story Drop word counts

**Result:** `src/lib/story-generator.ts` assembled from these patterns

---

## 4. Loomiverse — Supabase Migration Pattern

**Source:** `~/Desktop/Loomiverse-Online/` CLAUDE.md + supabase-setup.sql

**What to steal:** The explicit GRANT pattern. Every migration must include:

```sql
GRANT SELECT ON your_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON your_table TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON your_table TO service_role;
```

**Why:** As of late 2025, Supabase no longer auto-exposes new tables to the Data API. Skip the GRANTs and PostgREST returns `permission denied` silently. This cost Loomiverse significant debugging time. Don't repeat it.

Also steal:
- RLS policy structure — `subscriber_id = auth.uid()` for row-level isolation
- `is_admin` bypass pattern for admin dashboard endpoints
- Migration file naming convention

**Result:** All 4 Story Drop Supabase migrations with correct GRANTs from day one

---

## 5. Loomiverse — ContinuityGuard Concept

**Source:** `~/Desktop/Loomiverse-Online/src/lib/consistency/`

**What to steal:** The concept of tracking what has happened before and injecting it as a constraint on new generation. Loomiverse uses this to maintain character consistency across story sessions.

**How to adapt (simplified):**
- Instead of a full character bible, Story Drop stores only: last 10 story titles in `story_history`
- Inject as: "Avoid these plot structures (already used): [list]"
- Character continuity (Phase 4): `character_state` jsonb column — 4 fields max (name, type, quirk, last_event)

**Result:** `story_history` array in `storydrop_preferences`, injected into Layer 3 of prompt

---

## What NOT to Steal

- Loomiverse's `localStorage` sync system — Story Drop has no client-side state beyond the session
- Loomiverse's `PsychologyManager`, `RelationshipGraph`, `ConsistencyEngine` — massively overbuilt for weekly email stories
- Quiply's `lemonSqueezy.js` subscription system — Story Drop uses Stripe (better for subscription webhooks)
- Mockingbird's Telegram approval flow — no human approval needed, QC is automated
