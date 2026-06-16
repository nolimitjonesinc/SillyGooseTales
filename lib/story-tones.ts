// Stolen from Quiply/personalities.js — same id/name/description/prompt architecture
// adapted for children's story tone profiles

export type StoryTone = {
  id: string
  name: string
  description: string
  age_range: string
  system_prompt_snippet: string
}

export const STORY_TONES: StoryTone[] = [
  {
    id: 'cozy_bedtime',
    name: 'Cozy Bedtime',
    description: 'Warm, unhurried, rhythmic. The world gets quieter as the story goes on.',
    age_range: '3-10',
    system_prompt_snippet: `Write this story in a warm, unhurried tone. Sentences are gentle and rhythmic, like someone speaking softly in a dim room. Favor soft sensory details: warmth, softness, quiet sounds, fading light. The emotional arc bends toward peace and safety. By the final paragraph, the child in the story (and the child listening) should feel sleepy and held. Avoid excitement, urgency, or unresolved tension. Every problem finds a soft landing.`
  },
  {
    id: 'grand_adventure',
    name: 'Grand Adventure',
    description: 'Bold, kinetic, propulsive. The child protagonist is brave and capable.',
    age_range: '4-10',
    system_prompt_snippet: `Write this story with energy and momentum. Short punchy sentences during action. Use strong verbs — sprint, crash, discover, leap. The child protagonist makes brave choices under pressure. Obstacles feel genuinely challenging but never hopeless. The world is larger than it first appeared. By the end, the protagonist has done something they did not know they could do. Tone is triumphant — not loud, but earned. The final image should feel like standing on top of something.`
  },
  {
    id: 'giggle_factory',
    name: 'Giggle Factory',
    description: 'Silly, absurd, and completely unhinged in the most parent-approved way.',
    age_range: '3-8',
    system_prompt_snippet: `Write this story to make a child laugh out loud. Use absurd situations, unexpected reversals, and silly character behavior. Onomatopoeia is encouraged (SPLAT, WHOOSH, BLURP). At least one moment should involve something going hilariously wrong before going right. The humor is character-driven, never mean — characters are ridiculous because they are trying their best, not because they are foolish. Puns are allowed. The ending should land with a punchline or a warm absurd image that makes re-reading irresistible.`
  },
  {
    id: 'brave_heart',
    name: 'Brave Heart',
    description: 'Emotionally honest. Sits with the hard thing before resolving it.',
    age_range: '5-10',
    system_prompt_snippet: `Write this story with emotional honesty and courage. Acknowledge that the hard thing IS hard — do not rush past the feeling. The child protagonist is allowed to be scared, sad, or uncertain for most of the story. The resolution does not erase the difficulty; it shows the protagonist is stronger than the difficulty. Tone is quiet and real. Avoid false cheerfulness. The adult characters in the story notice the child's feelings without fixing them — the child must find their own way through. The final image should feel like a deep breath after something hard.`
  },
  {
    id: 'magic_and_wonder',
    name: 'Magic and Wonder',
    description: 'The world has secrets. Ordinary things are extraordinary up close.',
    age_range: '4-10',
    system_prompt_snippet: `Write this story as if the ordinary world contains a hidden magical layer that only curious children can see. Magic is not dramatic or flashy — it is quiet, specific, and earned by paying attention. The child protagonist discovers magic by noticing something other people walked past. Tone is hushed and wondering. Sentences can be longer and more lyrical here — the prose itself should feel like discovering something. The ending reveals one more layer of magic the reader did not see coming.`
  },
  {
    id: 'laugh_and_learn',
    name: 'Laugh and Learn',
    description: 'Curiosity-first. One real surprising fact embedded invisibly in the plot.',
    age_range: '5-10',
    system_prompt_snippet: `Write this story so that one genuine, interesting fact about the real world is embedded naturally in the plot — never stated as a lesson, always discovered through the story's events. The fact must be surprising and true (e.g., octopuses have three hearts, trees communicate through underground fungi, hummingbirds can fly backwards). The child protagonist's interest area should be the vehicle for this discovery. Tone is curious and playful. The ending should leave the child wanting to look something up or ask a parent a question.`
  }
]

export const AGE_BAND_SPECS: Record<string, { min: number; max: number; label: string }> = {
  '2': { min: 200, max: 350, label: '2' },
  '3': { min: 400, max: 550, label: '3-5' },
  '4': { min: 400, max: 550, label: '3-5' },
  '5': { min: 400, max: 550, label: '3-5' },
  '6': { min: 700, max: 900, label: '6-8' },
  '7': { min: 700, max: 900, label: '6-8' },
  '8': { min: 700, max: 900, label: '6-8' },
  '9': { min: 1100, max: 1400, label: '9-10' },
  '10': { min: 1100, max: 1400, label: '9-10' },
  '11': { min: 1300, max: 1600, label: '11-12' },
  '12': { min: 1300, max: 1600, label: '11-12' },
}

// Age-banded VOICE specs — controls the LANGUAGE of the story, not just the length.
// Without this, the model defaults to literary prose regardless of the child's age.
export const VOICE_SPECS: { maxAge: number; spec: string }[] = [
  {
    maxAge: 4,
    spec: `VOICE — write for a toddler listening at bedtime:
- Sentences are short. Most under 8 words. None over 12 words.
- Use only words a 3-year-old hears at home or daycare. If a kindergartner would not say it, cut it.
- Repetition is the engine of the story: pick one key phrase and repeat it at least 3 times so the child can chant along.
- Sound words are required — at least 3 (BOOM, splish, whoosh, mmmm).
- Everything must be concrete: things the child can see, touch, eat, or hug. No abstract ideas.
- Never describe feelings with imagery. Name them plainly (happy, sad, scared) or show them in the body (she stomped her feet, he hid his eyes).
- No metaphors. Similes only if both sides are everyday toddler objects ("orange like mac and cheese").
- Strong bouncy read-aloud rhythm with short beats. Do NOT write strict rhyme.
- One simple problem, solved one simple way. No subplots, no mystery left open.`
  },
  {
    maxAge: 7,
    spec: `VOICE — write for a kindergartner or early grade-schooler:
- Sentences mostly under 12 words. A few can stretch longer, but none over 18 words.
- Vocabulary is everyday spoken language, plus at most 2-3 delicious bigger words whose meaning is obvious from context ("enormous", "ridiculous").
- Humor comes from silly situations and characters trying their best, not from wordplay.
- Similes allowed ONLY if both sides are things a 6-year-old knows: "blue like a popsicle" works; "the color of a secret" does not.
- Never describe emotions with abstract imagery. Name the feeling plainly or show it physically.
- Use frequent short dialogue that is fun to read aloud in character voices.
- A repeated phrase or running joke is welcome.
- The plot stays in one clear storyline a child can retell at breakfast.`
  },
  {
    maxAge: 10,
    spec: `VOICE — write for a confident independent reader:
- Richer vocabulary and longer sentences are allowed. Keep paragraphs short and momentum high.
- Figurative language is allowed in SMALL doses: maximum 2 lyrical images per story, and each must grow out of something concrete in the scene.
- Wit and cleverness land well — trust the reader to get jokes without explanation.
- Feelings can be complex and partly unspoken.
- Something must happen in every paragraph. No paragraph of pure description.`
  },
  {
    maxAge: 12,
    spec: `VOICE — write for an almost-teen:
- Use a sharp middle-grade-novel voice: real stakes, dry humor, more interior thought.
- Never talk down to the reader. No babyish exclamations or sing-song narration.
- Lyrical prose is welcome where the moment earns it.
- Dialogue can carry subtext. The reader is smart — let them work a little.`
  },
]

export function getToneById(id: string): StoryTone | undefined {
  return STORY_TONES.find(t => t.id === id)
}

export function getAgeBandSpec(age: number) {
  // Clamp out-of-range ages to the nearest defined band instead of silently
  // defaulting to the middle band
  const clamped = Math.min(12, Math.max(2, age))
  return AGE_BAND_SPECS[String(clamped)] ?? AGE_BAND_SPECS['6']
}

export function getVoiceSpec(age: number): string {
  const clamped = Math.min(12, Math.max(2, age))
  const band = VOICE_SPECS.find(v => clamped <= v.maxAge)
  return band ? band.spec : VOICE_SPECS[VOICE_SPECS.length - 1].spec
}
