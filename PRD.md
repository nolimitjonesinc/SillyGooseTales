# Story Drop — Product Requirements Document

**Version:** 1.0
**Status:** Pre-build
**Owner:** DJ (nolimitlabs)

---

## What It Is

Story Drop is a personalized children's story newsletter. Parents subscribe once, configure preferences for their child (name, age, interests, story tone, themes), and receive an original AI-generated story by email on a schedule they choose. No app to open. No action required. The story just arrives.

The product is the email. The website is just where you sign up.

---

## The Problem It Solves

Every competitor in personalized children's content (BedtimeStory.ai, Oscar Stories, StoryBee) requires an active parent to open an app, configure a generation, and initiate a story. At 7:30pm on a Tuesday with a 4-year-old asking "can we read now," that friction is a dealbreaker. Parents don't need another thing to open. They need the story to already be there.

---

## Target User

**Primary:** Parents of children ages 3-10. Tired. On their phone. At or after dinner. Want the bedtime routine to work. Will pay for something that removes a decision, not adds one.

**Secondary:** Grandparents, aunts, uncles looking for a meaningful recurring gift that isn't another toy.

---

## Core Concept

1. Parent visits Story Drop landing page
2. Enters child name, one interest, and email → receives one free personalized story that evening (no credit card)
3. Story arrives personalized with child's name and interest woven into the plot
4. Day 1: Email from "Maya at Story Drop" asks what the child thought (engineers a reply → inbox placement)
5. Day 3: Upgrade prompt sells story completion: "Find out what happens to Finn — $9.99/month"
6. Paid subscribers complete full onboarding (8 screens), set delivery schedule, receive weekly stories forever

---

## Pricing

| Tier | Price | Details |
|---|---|---|
| Free | $0 | 1 story on signup night. No credit card. Unresolved recurring character at the end. |
| Monthly | $9.99/month | Weekly stories, full preferences, single child profile |
| Annual | $89.99/year | 25% off ($7.50/month equivalent). Push this at every conversion touchpoint. |

Annual subscribers churn 51% less than monthly. Monthly churn in B2C parent markets runs 8-12% per month seasonally. Annual billing is the primary structural defense.

---

## Revenue Model

At 5% paid conversion (realistic B2C newsletter floor):

| Total Subscribers | Paid Users | Gross MRR | Net MRR |
|---|---|---|---|
| 1,000 | 50 | $500 | ~$400 |
| 3,500 | 175 | $1,750 | ~$1,450 |
| 5,000 | 250 | $2,500 | ~$2,100 |
| 10,000 | 500 | $5,000 | ~$4,200 |

Infrastructure costs: ~$62/month at 1K subscribers, ~$172/month at 5K.
AI cost per story: ~$0.005 (Claude Haiku 3.5).

---

## User Flow

### Free User Flow
1. Landing page → "Get your child's first story free tonight"
2. Enter: child name, one interest, email address
3. Email confirmed (double opt-in)
4. Story generates and delivers that evening
5. Day 1: Reply-request email from Maya
6. Day 3: Upgrade prompt with cliffhanger hook
7. Downgrade: After free story, 1 story/month to stay warm — not satisfied

### Paid User Flow (Full Onboarding)
After payment, parent completes 8-screen wizard:

1. **Welcome** — "A story. Every week. Just for them." One button: "Let's set it up."
2. **Who is this for?** — Child name (text) + age (pill buttons 3-10)
3. **What does [Name] love?** — Interest chips, multi-select, min 1 max 6
4. **Story ingredients** — Themes in ("Always stir in...") + themes out ("Leave these out entirely")
5. **What kind of stories?** — Single tone card select (5 options)
6. **When should it arrive?** — Day + time slot + timezone (auto-detected) + email confirm
7. **Add to contacts** ← Critical. Screenshot walkthrough. Framed as "so the story always finds its way to bedtime." Ships at launch.
8. **All set** — "[Name]'s first story arrives [day] at [time]."

---

## Interest Options (Multi-Select)
Dinosaurs, Space, Animals, Sports, Art, Vehicles, Ocean, Bugs, Castles, Robots, Fairies, Nature, Cooking, Music

## Theme Include Options
Adventure, Friendship, Family, Magic, Humor, Kindness, Courage, Curiosity

## Theme Exclude Options
Scary content, Violence, Loss or death, Strangers, Nightmares, Potty humor

---

## Story Spec

### Age Bands

| Band | Word Count | Read-Aloud | Notes |
|---|---|---|---|
| 3-5 | 400-550 words | 5 min | Single emotion arc, concrete nouns only, repetition is structural |
| 6-8 | 700-900 words | 10 min | Two-thread arc, failed first attempt mandatory, three-act structure |
| 9-10 | 1,100-1,400 words | 15 min | Chapter-book vocabulary, moral ambiguity tolerable, earned surprise |

### Required Story Beats

Every story must hit all 7 beats:

1. **Grounding (10%):** Child's name in the first sentence, in action. World in one vivid image.
2. **Want vs. Need (15%):** Surface goal stated. Deeper emotional need implied, never named.
3. **Inciting Disruption (10%):** Something surprising or unfair changes the world.
4. **First Attempt Fails (20%):** Obvious solution tried — insufficient. Non-negotiable beat.
5. **Complication or Ally (15%):** Problem escalates or unexpected help arrives. Ally enables, never rescues.
6. **Protagonist-Driven Resolution (20%):** Child makes the key decision. Adults assist only.
7. **Landing (10%):** One sensory image closes the arc. No moral summary.

### Tone Profiles (6)

| ID | Name | Feel |
|---|---|---|
| cozy_bedtime | Cozy Bedtime | Warm, unhurried, world gets quieter |
| grand_adventure | Grand Adventure | Bold, kinetic, protagonist is brave |
| giggle_factory | Giggle Factory | Absurd, silly, ends with a punchline |
| brave_heart | Brave Heart | Emotionally honest, no false cheerfulness |
| magic_and_wonder | Magic and Wonder | Quiet specific magic earned by paying attention |
| laugh_and_learn | Laugh and Learn | One real surprising fact embedded invisibly |

Full system prompt snippets in `docs/tone-profiles.md`.

### Personalization Rules

- **Child name:** 3 appearances maximum per story (opening, emotional peak, closing). In action and dialogue — never just introduction.
- **Primary interest:** Load-bearing to the plot resolution — child's knowledge/skill in this area is why the problem gets solved. Decorative interest-dropping is detected by parents by story two.
- **Themes exclude:** Hard constraints, injected in Layer 5 before any creative generation begins.
- **Story history:** Last 10 story titles stored per subscriber, injected as avoided plot structures.
- **Recurring character state:** character_state column exists from Phase 1. Serialization ships Month 4. Four fields max: name, type/species, one quirk, one thing that happened last time.

### Quality Failure Modes to Prevent

1. **Flat conflict** — obstacle appears, protagonist tries once, it works. No resistance.
2. **Passive protagonist** — adult or helper solves the problem while child watches.
3. **Moral announcement** — story states its lesson as dialogue or narration.
4. **Sentence rhythm monotony** — all sentences same length, droning when read aloud.
5. **Interest as decoration** — child's interest appears in sentence one, then vanishes.
6. **Tonal bleed** — cozy story generates excitement or unresolved tension.
7. **Repetitive plot structures** — same 3-4 underlying shapes across a subscriber's story history.

---

## Story Generation Pipeline

### 5-Layer Prompt System

Layer 1 (static): Identity lock — who Claude is, what it never does
Layer 2 (per family): Tone profile system prompt snippet
Layer 3 (per story): Personalization block — child name, age, interests, avoided plot titles, recurring character brief
Layer 4 (per age band): Structure directive with hard word count ceiling
Layer 5 (static, appended LAST): Quality constraints — overrides any creative drift

### Generation Schedule

- Vercel Cron fires daily at 6am UTC
- Finds subscribers with delivery_at falling in the next 24 hours
- Generates story → QC → queue
- No AI call at delivery time — delivery cron sends pre-generated content only

### QC Scoring

Every story scored against 5 criteria before queuing:
1. Protagonist drives resolution (not adult) — PASS/FAIL
2. Child's interest affects plot outcome (not decorative) — PASS/FAIL
3. No explicit moral statement in dialogue or narration — PASS/FAIL
4. Word count within age band range — PASS/FAIL
5. Tone matches selected profile — PASS/FAIL

PASS all 5 → queue. Any FAIL → regenerate. Max 2 retries. Still failing → flag for admin.

---

## Email Template

**Format:** Near-plain-text. No exceptions.

- Sender: `Maya at Story Drop <maya@mail.storydrop.com>`
- Subject: `[Child name]'s story is here — [Story Title]`
- Pre-header: `[Name] is going to love this one.`
- Body font: Georgia (system), 18px, 1.8 line-height, white background
- Zero hero images. Zero decorative HTML.
- Story title in warm amber (#E8A838), large type — the one design flourish allowed
- Section divider: ✦ (plain text)
- Footer: 3 lines only — preferences link / pause link / unsubscribe

---

## Automated Monitoring

### Weekly Health Digest (Monday 8am UTC)
- Delivery success rate (target: >99%)
- QC failure rate (target: <5% needing regeneration)
- Stories regenerated 2x and still flagged (review queue)
- Subscriber count change week-over-week
- Any delivery failures in the past 7 days
- Email sent to `nolimitjones@gmail.com`

### Churn Early Warning
- Subscriber hasn't opened in 3+ deliveries → queue re-engagement story with different tone
- Still no open after 2 more → pause delivery, send "still want stories?" email automatically

---

## Technical Architecture

### Supabase Schema

```
storydrop_subscribers
  id uuid PK
  email text UNIQUE
  stripe_customer_id text
  stripe_subscription_id text
  subscription_status text (active/cancelled/paused/free_trial)
  created_at timestamptz
  updated_at timestamptz

storydrop_preferences
  id uuid PK
  subscriber_id uuid FK → storydrop_subscribers
  child_name text
  child_age int
  interests text[]
  themes_include text[]
  themes_exclude text[]
  tone_profile text
  delivery_day text (monday/tuesday/.../sunday)
  delivery_slot text (morning/afternoon/evening)
  timezone text (IANA, e.g. America/New_York)
  story_history text[] (last 10 story titles)
  character_state jsonb (name, type, quirk, last_event — null until Month 4)
  created_at timestamptz
  updated_at timestamptz

storydrop_story_queue
  id uuid PK
  subscriber_id uuid FK
  story_title text
  story_body text
  delivery_at timestamptz (UTC)
  status text (queued/delivered/failed)
  retry_count int DEFAULT 0
  qc_score jsonb
  created_at timestamptz

storydrop_delivery_log
  id uuid PK
  subscriber_id uuid FK
  story_queue_id uuid FK
  delivered_at timestamptz
  resend_message_id text
  status text (delivered/bounced/failed)
  created_at timestamptz
```

### API Endpoints

```
POST /api/subscribe          — Free tier signup, generate first story
POST /api/checkout           — Stripe checkout session creation
POST /api/webhooks/stripe    — Stripe subscription state changes (writes Supabase only)
POST /api/onboarding         — Save full preference set after payment
GET  /api/preferences        — Read preferences (magic link auth)
PUT  /api/preferences        — Update preferences
POST /api/pause              — Pause delivery (magic link)
POST /api/unsubscribe        — Unsubscribe (magic link)

POST /api/queue-stories      — Vercel Cron: daily 6am UTC, generate + QC + queue
POST /api/deliver-stories    — Vercel Cron: every 5 min, send due stories
POST /api/health-digest      — Vercel Cron: Monday 8am UTC, send summary email
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_MONTHLY
STRIPE_PRICE_ID_ANNUAL
RESEND_API_KEY
ANTHROPIC_API_KEY
ADMIN_EMAIL=nolimitjones@gmail.com
STORYDROP_DRY_RUN=false
```

---

## Acquisition Strategy

**Primary channel at launch:** Gift positioning — grandparents, aunts, uncles.
*"The most personal gift you can give a child — a story written just for them, every week."*

Requires: gift checkout flow in Stripe (one landing page variant, gift recipient gets the subscription).

**Secondary:** Parenting Facebook groups (genuine participation, share free story as resource).

**Third:** Pinterest SEO — "personalized bedtime stories" is evergreen high-intent search.

**TikTok organic:** Phase 2 after you have 50+ paid subscribers with stories to show.

---

## Deliverability Requirements (Non-Negotiable)

Phase 0 completes before Phase 1 begins. These must be in place before the first paid subscriber onboards:

1. Custom sending domain configured (mail.storydrop.com)
2. SPF published
3. DKIM (2048-bit) published
4. DMARC published (start p=none, move to p=quarantine after 30 days clean)
5. Google Postmaster Tools registered
6. Test email confirmed in Gmail Primary (not Promotions)
7. "Add to contacts" onboarding step designed and tested

---

## Build Phases

| Phase | Goal | Agent Hours | Milestone |
|---|---|---|---|
| 0 — Deliverability | Domain + email auth configured | 3 | Test email lands in Gmail Primary |
| 1 — Skeleton | Sign up, pay, dashboard | 8 | Real card charges $9.99 |
| 2 — Onboarding | Wizard + tone profiles | 7 | Sample story in founder's inbox |
| 3 — Pipeline | Generate + QC + queue + deliver | 11 | Scheduled story in real inbox at correct local time |
| 4 — Launch | Email template + hardening + landing page | 8 | Public URL live |

Total: ~37 agent-hours

---

## Out of Scope at Launch

- Recurring character serialization (Month 4)
- Multiple child profiles per subscription (Phase 2 feature)
- Audio narration
- Gift subscriptions (Phase 2 — launch with individual only)
- Mobile app (never — the email IS the product)
- Social sharing of stories
