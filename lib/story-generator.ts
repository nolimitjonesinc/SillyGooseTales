import { getAnthropic } from './clients'
import { getToneById, getAgeBandSpec } from './story-tones'
import type { Preferences } from './supabase'

const LAYER_1_IDENTITY = `You are a master children's story author writing a personalized weekly story for a single child. Your stories are age-appropriate, read-aloud optimized, and parent-safe. You NEVER include: violence beyond mild cartoon consequence, adult relationships or romance, imagery designed to frighten, explicit moral lessons stated as dialogue or narration, or anything a school librarian would flag.`

const LAYER_5_CONSTRAINTS = `QUALITY CONSTRAINTS — these override everything above:
- The theme or lesson must NEVER appear as spoken dialogue or narration. Show it through action and consequence only.
- Every sentence must be readable aloud without the parent stumbling. No passive constructions over 12 words for children under 6.
- Include at least one concrete sensory detail (something seen, heard, or felt) in each of the three main sections.
- The child protagonist must drive the solution — adults may assist but the child's idea or courage is the catalyst.
- The final paragraph must contain a sensory image AND leave the child with warmth or possibility.
- Antagonists and obstacles must be resolved through empathy or creative thinking, never defeat or punishment.
- Vary sentence length deliberately: include at least one sentence under 6 words and at least one over 20 words.
- Do NOT state any theme, lesson, or moral — it must emerge from the plot events only.`

function buildStructureDirective(age: number, minWords: number, maxWords: number): string {
  const isYoung = age <= 5
  return `STORY STRUCTURE — follow this beat-by-beat:
- HOOK (first 15%): Open mid-action or mid-sensation. Child's name in the first sentence, in action not introduction. World established in one vivid image. Problem or desire introduced before end of section.
- WANT + OBSTACLE (next 25%): One clear specific want. One emotionally real obstacle — losing something, being left out, something not working. ${isYoung ? 'Keep to one simple scene.' : 'Introduce the recurring character here if applicable.'}
- ATTEMPT + COMPLICATION (next 30%): Protagonist tries the obvious solution — it is insufficient. This is non-negotiable. The child's stated interest becomes the key insight. The obstacle reveals something surprising (it is scared, it needs help, it is a misunderstanding).
- RESOLUTION (next 20%): Child-driven solution — creative and protagonist-led. Tone matches the selected profile exactly.
- CLOSING IMAGE (final 10%): One sensory moment. The world feels slightly larger and safer. No moral summary. Just the feeling.

WORD COUNT: Write between ${minWords} and ${maxWords} words. This is a hard ceiling — do not exceed ${maxWords} words under any circumstances.
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

export async function generateStory(prefs: Preferences): Promise<{ title: string; body: string; inputTokens: number; outputTokens: number }> {
  const toneId = (prefs.tone_profiles?.length)
    ? prefs.tone_profiles[Math.floor(Math.random() * prefs.tone_profiles.length)]
    : prefs.tone_profile

  const tone = getToneById(toneId)
  const ageBand = getAgeBandSpec(prefs.child_age)

  if (!tone) throw new Error(`Unknown tone profile: ${toneId}`)

  const systemPrompt = [
    LAYER_1_IDENTITY,
    tone.system_prompt_snippet,
    buildPersonalizationBlock(prefs),
    buildStructureDirective(prefs.child_age, ageBand.min, ageBand.max),
    LAYER_5_CONSTRAINTS
  ].join('\n\n---\n\n')

  const response = await getAnthropic().messages.create({
    model: 'claude-haiku-3-5-20241022',
    max_tokens: 1800,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Write the story now.' }]
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
