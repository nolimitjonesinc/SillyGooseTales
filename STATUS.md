# Silly Goose Tales — Status
_Auto-updated by Status Brain on every push. Last change: Add Status Brain workflow to auto-document project state on every push._

**Status:** Live  
**What it is:** A Next.js app that generates and emails personalized AI bedtime stories to subscribers on a schedule they choose.  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Anthropic Claude API, Resend (email), Lemon Squeezy (payments).

## What works right now
- **Story generation** — Claude API generates bedtime stories based on mood, tone, and preferences; includes quality control with self-correcting retries (up to 5 attempts)
- **Subscriber onboarding** — Multi-step wizard collects name, email, delivery preferences, mood, and tone; awaits story generation before signup completes
- **Scheduled delivery** — Stories queue and deliver on subscriber's chosen day/time via Resend email
- **Email receipts** — Transactional emails confirm story delivery with clickable link to view story
- **Admin dashboard** — Displays revenue, subscriber list, pipeline status, story QC flags, and actions to approve/regenerate flagged stories
- **Payment processing** — Lemon Squeezy handles checkout, subscriptions, and webhooks; receipt links loop back to onboarding correctly
- **Story page** — Authenticated view for displaying individual stories with print button and upgrade section
- **SEO basics** — Sitemap and robots.txt for search indexing
- **Blog** — Markdown-based blog at `/blog` with dynamic slug routing
- **Privacy & terms** — Legal pages and footer links
- **Pause/resume subscriptions** — API endpoints for subscription management
- **Preferences API** — Allows updates to mood and delivery settings

## Recent changes (newest first)
- 2026-07-20 — Add Status Brain workflow to auto-document project state on every push
- 2026-07-06 — Add sitemap and robots.txt for SEO
- 2026-07-05 — Add markdown blog at /blog with dynamic page routing
- 2026-06-17 — Improve story quality: always deliver a story + boost first-try QC pass rate; make retries self-correcting and fix short-story bias
- 2026-06-16 — Speed up signup flow and increase QC retries to 5; fix checkout crash on story page
- 2026-06-10 — Add privacy/terms pages, footer links, upgrade to Claude Haiku 4.5
- 2026-06-07 — Complete admin dashboard: revenue panel, subscriber table, pipeline timing, flagged story management
- 2026-06-05 — Fix receipt email link going to homepage instead of looping back to onboarding

## Reusable parts (for other projects)
- **Status Brain** — Auto-generated project status from git history and code inspection — `.github/workflows/status-brain.yml`, `status-brain.mjs`
- **AI Story Generation** — Modular story generator with tone profiles and quality scoring — `lib/story-generator.ts`, `lib/story-tones.ts`, `lib/qc-scorer.ts`
- **Email Template System** — React Email components for transactional emails — `emails/StoryEmail.tsx`, `emails/ReplyRequestEmail.tsx`
- **Markdown Blog** — Next.js dynamic blog with frontmatter parsing — `lib/blog.ts`, `app/blog/[slug]/page.tsx`
- **Admin Dashboard** — Revenue tracking, subscriber table, pipeline visibility — `app/admin/` folder

## Not done / next
- **Analytics** — No user behavior tracking or engagement metrics yet
- **A/B testing** — No framework for testing story variants or UI changes
- **Advanced scheduling** — Only supports one delivery day/time per subscriber; no flexible scheduling window
- **Multi-language support** — Stories generated only in English
- **Mobile app** — Only web app exists
- **Referral system** — No built-in invite/referral mechanics
- **Custom story requests** — Subscribers can't request specific themes mid-subscription
- **Story library/archive** — No way to browse or search past stories
- **Performance monitoring** — No uptime dashboard or API latency tracking beyond health digest
- **Dunning management** — No retry logic for failed payment cards
