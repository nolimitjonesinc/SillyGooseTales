import { getAnthropic } from './clients'
import { getToneById, getAgeBandSpec, getVoiceSpec } from './story-tones'
import type { Preferences } from './supabase'

const LAYER_1_IDENTITY = `You are a master children's story author writing a personalized weekly story for a single child. Your stories are age-appropriate, read-aloud optimized, and parent-safe. You NEVER include: violence beyond mild cartoon consequence, adult relationships or romance, imagery designed to frighten, explicit moral lessons stated as dialogue or narration, or anything a school librarian would flag.`

function buildConstraints(age: number): string {
  // Sentence-variety rule scales with age — demanding 20+ word sentences from a
  // story meant for a 4-year-old is how toddler stories end up sounding like
  // literary fiction
  const sentenceRule = age <= 7
    ? '- Vary sentence length deliberately: include several sentences under 6 words. Long sentences are forbidden by the VOICE rules above — the VOICE rules win.'
    : '- Vary sentence length deliberately: include at least one sentence under 6 words and at least one over 20 words.'

  return `QUALITY CONSTRAINTS — these override everything above EXCEPT the VOICE rules:
- The theme or lesson must NEVER appear as spoken dialogue or narration. Show it through action and consequence only.
- Every sentence must be readable aloud without the parent stumbling. No passive constructions over 12 words for children under 6.
- Include at least one concrete sensory detail (something seen, heard, or felt) in each of the three main sections.
- The child protagonist must drive the solution — adults may assist but the child's idea or courage is the catalyst.
- The final paragraph must contain a sensory image AND leave the child with warmth or possibility.
- Antagonists and obstacles must be resolved through empathy or creative thinking, never defeat or punishment.
${sentenceRule}
- Do NOT state any theme, lesson, or moral — it must emerge from the plot events only.
- The VOICE rules define the language level for this child's age. If any instruction here or above conflicts with the VOICE rules, follow the VOICE rules.

GRADING — your story will be automatically checked against these 5 rules and rejected if it misses ANY. Get them all right the first time:
1. The CHILD solves the problem with their own idea or courage — not an adult, not magic, not luck.
2. The child's stated interest is the KEY to solving the problem, not just background decoration.
3. NO stated lesson. The story must never explain its own point. This is the rule most stories fail — do not end by telling the reader what was learned or why it mattered. BANNED final lines like: "He was helping." / "And that made her brave." / "She learned she was stronger than she thought." / "It felt good to be kind." End on a SENSORY IMAGE or a feeling shown through action — never a summary of the meaning.
4. Length: stay within the required word count. Coming in UNDER the minimum is an automatic rejection — write to the target, lean long.
5. The ending's feeling must match the chosen tone exactly.`
}

function buildStructureDirective(age: number, minWords: number, maxWords: number): string {
  const isYoung = age <= 5
  // Aim the model at the upper-middle of the band. Left to its own devices it
  // plays safe and undershoots, landing below the minimum and failing QC.
  const target = minWords + Math.round((maxWords - minWords) * 0.6)
  return `STORY STRUCTURE — follow this beat-by-beat:
- HOOK (first 15%): Open mid-action or mid-sensation. Child's name in the first sentence, in action not introduction. World established in one vivid image. Problem or desire introduced before end of section.
- WANT + OBSTACLE (next 25%): One clear specific want. One emotionally real obstacle — losing something, being left out, something not working. ${isYoung ? 'Keep to one simple scene.' : 'Introduce the recurring character here if applicable.'}
- ATTEMPT + COMPLICATION (next 30%): Protagonist tries the obvious solution — it is insufficient. This is non-negotiable. The child's stated interest becomes the key insight. The obstacle reveals something surprising (it is scared, it needs help, it is a misunderstanding).
- RESOLUTION (next 20%): Child-driven solution — creative and protagonist-led. Tone matches the selected profile exactly.
- CLOSING IMAGE (final 10%): One sensory moment. The world feels slightly larger and safer. No moral summary. Just the feeling.

WORD COUNT: Write between ${minWords} and ${maxWords} words. Aim for about ${target} words. Writing FEWER than ${minWords} words is an automatic failure — the story will be rejected, so err on the longer side. Do not exceed ${maxWords} words.
Return only the story text with the title on the very first line, then a blank line, then the story. No labels, no commentary.`
}

const MOOD_DIRECTIVES: Record<string, string> = {
  happy: `Tonight's mood: the child is happy and content. Lean into joy, warmth, and celebration. The story should feel like a good day getting even better.`,
  sleepy: `Tonight's mood: the child is sleepy and winding down. Keep the story calm, cozy, and slow. Every sentence should feel like a warm blanket. End with stillness.`,
  silly: `Tonight's mood: the child is in a silly, giggly mood. Lean hard into absurdity and humor. At least two genuinely funny moments. Maximum goofiness, minimum logic.`,
  excited: `Tonight's mood: the child is buzzing with excitement. Channel that energy — the story moves fast, the stakes feel real, the ending is triumphant.`,
  anxious: `Tonight's mood: the child is feeling anxious or worried. Write a story where the protagonist faces a similar worry and discovers it is smaller than it seemed. Gentle and reassuring. No jump scares, no unresolved tension.`,
}

function buildPersonalizationBlock(prefs: Preferences): string {
  const interests = prefs.interests.join(', ')
  const excludes = prefs.themes_exclude.length > 0
    ? `\nNEVER include these themes: ${prefs.themes_exclude.join(', ')}.`
    : ''
  const history = prefs.story_history.length > 0
    ? `\nAvoid these plot structures already used: ${prefs.story_history.join('; ')}.`
    : ''
  const character = prefs.character_state
    ? `\nThe story features a returning character: ${prefs.character_state.name}, a ${prefs.character_state.type} who ${prefs.character_state.quirk}. Last time: ${prefs.character_state.last_event}.`
    : ''
  const mood = prefs.mood ? `\n\n${MOOD_DIRECTIVES[prefs.mood]}` : ''

  return `PERSONALIZATION:
The child's name is ${prefs.child_name}, age ${prefs.child_age}. They love ${interests}.
The child's stated interest (${interests}) must be load-bearing to the plot — it should be the reason the problem gets solved, not just mentioned in passing.
Use the child's name naturally in the first sentence (in action), at the emotional peak, and in the closing image. Maximum 3 appearances total.${excludes}${history}${character}${mood}`
}

export async function generateStory(prefs: Preferences, feedback?: string): Promise<{ title: string; body: string; inputTokens: number; outputTokens: number }> {
  const toneId = (prefs.tone_profiles?.length)
    ? prefs.tone_profiles[Math.floor(Math.random() * prefs.tone_profiles.length)]
    : prefs.tone_profile

  const tone = getToneById(toneId)
  const ageBand = getAgeBandSpec(prefs.child_age)

  if (!tone) throw new Error(`Unknown tone profile: ${toneId}`)

  const systemPrompt = [
    LAYER_1_IDENTITY,
    tone.system_prompt_snippet,
    getVoiceSpec(prefs.child_age),
    buildPersonalizationBlock(prefs),
    buildStructureDirective(prefs.child_age, ageBand.min, ageBand.max),
    buildConstraints(prefs.child_age)
  ].join('\n\n---\n\n')

  // On a retry, tell the model exactly what the quality checker rejected last
  // time so it corrects that specific problem instead of blindly re-rolling.
  const userMessage = feedback
    ? `Your previous attempt was REJECTED by the quality checker for this reason:\n\n"${feedback}"\n\nWrite a brand-new full story that fixes exactly that problem while still following every rule above. Write the story now.`
    : 'Write the story now.'

  const response = await getAnthropic().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2400,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const lines = raw.trim().split('\n')
  const title = lines[0].replace(/^#\s*/, '').trim()
  const body = lines.slice(2).join('\n').trim()

  return {
    title,
    body,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  }
}
