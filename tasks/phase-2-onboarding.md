# Phase 2 — Onboarding Wizard + Tone Profiles

**Goal:** Parent completes 8-screen wizard and receives a sample story in their inbox.
**Prerequisite:** Phase 1 complete — payments working.

---

## Tasks

### Tone Profile System
- [ ] Copy `~/Desktop/Quiply-v1.0.6/personalities.js` architecture to `src/lib/story-tones.js`
- [ ] Remove window.personalities browser global — export as ES module: `export const STORY_TONES = [...]`
- [ ] Add `age_range` field to each profile alongside existing id/name/description
- [ ] Add `system_prompt_snippet` field (full prompt strings in `docs/tone-profiles.md`)
- [ ] 6 profiles: cozy_bedtime, grand_adventure, giggle_factory, brave_heart, magic_and_wonder, laugh_and_learn

### Onboarding Wizard (8 Screens)
Build as a multi-step form with Framer Motion slide transitions. Progress bar at top (thin, amber).

- [ ] **Screen 1 — Welcome:** Headline "A story. Every week. Just for them." Single CTA button. 15 seconds max.
- [ ] **Screen 2 — Who is this for?:** Child name text input + age pill buttons (3-10). Dynamic: after name typed, UI says "Perfect. How old is [Name]?"
- [ ] **Screen 3 — What does [Name] love?:** Interest chips multi-select (min 1, max 6). shadcn ToggleGroup component. 44px min touch target.
- [ ] **Screen 4 — Story ingredients:** Two sections on one scrollable screen. "Always stir in..." (themes include) + "Leave these out entirely" (themes exclude). Muted treatment on exclude chips.
- [ ] **Screen 5 — What kind of stories?:** Single tone card select. Five stacked cards. Selected card expands slightly, others fade.
- [ ] **Screen 6 — When should it arrive?:** Day picker + 3 time slot buttons (Morning/Afternoon/Evening) + auto-detected timezone (soft confirm, one-tap override) + email confirm field.
- [ ] **Screen 7 — Add to contacts:** Screenshot walkthrough for Gmail and Apple Mail. Copy: "So the story always finds its way to bedtime." Not optional. Ships at launch.
- [ ] **Screen 8 — All set:** "[Name]'s first story arrives [day] at [time]." Optional share prompt. No upsells. No popups.

### Preference Storage
- [ ] POST `/api/onboarding` — saves full preference set to `storydrop_preferences`
- [ ] Store delivery timezone as IANA string (e.g., `America/New_York`) — auto-detected via `Intl.DateTimeFormat().resolvedOptions().timeZone` on client
- [ ] Store delivery_at as UTC using `date-fns-tz` — never store raw hour or offset

### Sample Story on Signup
- [ ] After onboarding completes, trigger immediate story generation (one story, delivered within 30 minutes)
- [ ] This is a preview — confirms to the parent that the product works before the first scheduled delivery

---

## Done When

Full onboarding completes including the add-to-contacts step. A sample story arrives in the founder's test inbox with the correct child name, tone, and interests reflected in the plot.
