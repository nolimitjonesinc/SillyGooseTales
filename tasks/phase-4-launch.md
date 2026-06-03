# Phase 4 — Email Template + Launch Hardening

**Goal:** Public URL live. Strangers can find it, pay, get stories, cancel themselves.
**Prerequisite:** Phase 3 complete — pipeline delivering stories to real inboxes.

---

## Tasks

### React Email Template
- [ ] Install React Email: `npm install @react-email/components`
- [ ] Build `emails/StoryEmail.tsx`:
  - White background (#FFFFFF)
  - Georgia system serif, 18px body, 1.8 line-height
  - Story title: large type, warm amber (#E8A838), centered
  - One context line above title: "A story for [Name], [day] evening"
  - Story body: short paragraphs, natural breaks every 80-100 words
  - Section divider after story: centered ✦ plain text
  - Footer: 3 lines only — preferences link / pause link / unsubscribe — plain text, no social icons
  - Max width: 600px, single column
  - Zero hero images, zero decorative HTML
- [ ] Build `emails/WelcomeEmail.tsx` — confirmation with add-to-contacts instructions again
- [ ] Build `emails/ReplyRequestEmail.tsx` — day 1 email from Maya asking what the child thought
- [ ] Build `emails/UpgradeEmail.tsx` — day 3 "find out what happens to Finn" prompt
- [ ] Build `emails/HealthDigestEmail.tsx` — Monday admin summary

### Landing Page
- [ ] Build landing page at `/`
  - Headline: "A story. Every week. Just for [child's name]."
  - Sub: "Personalized bedtime stories delivered to your inbox. Set it once. Let the stories arrive."
  - Primary CTA: "Get your child's first story free tonight" → free signup flow
  - Pricing section: $9.99/month prominently, $89.99/year with "25% off" badge
  - 3 example story blurbs (non-interactive) showing personalization
  - No demo, no video, no lengthy feature list — this is a "try it free tonight" product
  - Warm Tailwind palette (paper background, amber accents) — the landing page gets the nice design, not the email

### Free Signup Flow
- [ ] Build `/signup` — 3 fields only: child name, one interest (single select), email
- [ ] No account creation, no password, no credit card
- [ ] On submit: save to Supabase as `subscription_status: free_trial`, trigger immediate story generation
- [ ] Confirmation screen: "Check your inbox tonight — [Name]'s story is on its way."

### Magic Link Auth for Preference Management
- [ ] All preference management links use magic link tokens (no login required)
- [ ] `/preferences?token=[uuid]` — view and edit preferences
- [ ] `/pause?token=[uuid]` — pause delivery (one click, no confirm dialog)
- [ ] `/unsubscribe?token=[uuid]` — unsubscribe (one click)
- [ ] Tokens stored in `storydrop_subscribers`, expire after 30 days, refresh on use

### Welcome Sequence (Resend Drip)
- [ ] Day 0: Confirmation email with add-to-contacts instructions (again)
- [ ] Day 1: Story delivery (first story)
- [ ] Day 2: Reply-request email from "Maya at Story Drop" — "Did [Name] enjoy meeting Finn?" — engineers a reply
- [ ] Day 3: Soft upgrade prompt (free users only) — "Find out what happens to Finn — $9.99/month"

### Rate Limiting + Safety
- [ ] Rate limit `/api/generate-story` — max 1 story per subscriber per 23 hours
- [ ] Rate limit free signup — max 3 free trials per IP per day
- [ ] Add spam protection on signup form (honeypot field, not CAPTCHA)

### Stripe Customer Portal
- [ ] Add "Manage subscription" link in dashboard → Stripe Customer Portal URL
- [ ] No custom cancellation flow — Stripe handles it

### Admin Page Hardening
- [ ] `/admin` dashboard: delivery stats, queue depth, recent failures, QC review queue
- [ ] Protected by Supabase RLS is_admin check on `loom_profiles` equivalent (storydrop_subscribers admin flag)
- [ ] Add admin flag to your own subscriber row in Supabase

### Pre-Launch Checklist
- [ ] Test full flow: signup → free story → upgrade → paid story → pause → resume → cancel
- [ ] Test from a phone (90% of parents open email on mobile)
- [ ] Verify story email lands in Gmail Primary (not Promotions) for a fresh Gmail account
- [ ] Verify unsubscribe works in one click
- [ ] Verify Stripe cancellation reflects in Supabase within 5 minutes
- [ ] Verify delivery failure retry works (manually flag a story as failed, confirm retry fires)
- [ ] Verify DST edge case: create a subscriber in a DST-observing timezone, check delivery_at recalculates correctly

---

## Done When

Public URL live. Real payment works. Stories arrive on schedule. Admin can see what's happening. DJ can go to sleep and the product runs itself.
