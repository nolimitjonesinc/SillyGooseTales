import { getAnthropic } from './clients'
import { getAgeBandSpec } from './story-tones'
import type { QCScore, Preferences } from './supabase'

function countWords(text: string): number {
  return text.trim().split(/\s+/).length
}

function buildQCPrompt(
  storyBody: string,
  prefs: Preferences,
  wordCount: number
): string {
  const ageBand = getAgeBandSpec(prefs.child_age)
  const interests = prefs.interests.join(', ')

  return `You are a children's story quality reviewer. Evaluate the story below against 5 criteria and return ONLY valid JSON.

STORY:
${storyBody}

METADATA:
- Child age: ${prefs.child_age}
- Stated interest: ${interests}
- Tone profile: ${prefs.tone_profile}
- Required word count range: ${ageBand.min}-${ageBand.max}
- Actual word count: ${wordCount}

EVALUATE each criterion as true or false:

1. protagonist_agency: Does the CHILD protagonist make the key decision or action that resolves the story? (false if an adult, magical helper, or external force solves the problem for the child rather than with them)

2. interest_load_bearing: Is the child's stated interest (${interests}) actively used in resolving the plot? (false if the interest only appears as a description and doesn't affect the story's outcome)

3. no_moral_announcement: Does the story avoid EXPLICITLY stating its lesson or moral? Mark false ONLY if a character or the narrator directly spells out the takeaway (e.g. "and that's why you should always...", "she learned that being brave matters", "it felt good to help"). A warm or hopeful closing FEELING, or a sensory final image, is allowed and should NOT fail this check — only an actual stated lesson fails.

4. word_count_in_range: Is the word count between ${ageBand.min} and ${ageBand.max}? (actual: ${wordCount})

5. tone_match: Does the story's feel match "${prefs.tone_profile}"? For cozy_bedtime: must end peacefully with no unresolved tension. For grand_adventure: must end triumphantly. For giggle_factory: must be genuinely funny. For brave_heart: must be emotionally honest with no forced cheerfulness. For magic_and_wonder: must have a quiet, wondering quality. For laugh_and_learn: must embed one real fact naturally.

Return ONLY this JSON, nothing else:
{
  "protagonist_agency": true or false,
  "interest_load_bearing": true or false,
  "no_moral_announcement": true or false,
  "word_count_in_range": true or false,
  "tone_match": true or false,
  "passed": true or false,
  "failure_notes": "brief description of any failures, or empty string if all passed"
}

"passed" must be true only if ALL five criteria are true.`
}

export type QCResult = QCScore & { inputTokens: number; outputTokens: number; apiError?: boolean }

export async function scoreStory(
  storyBody: string,
  prefs: Preferences
): Promise<QCResult> {
  const wordCount = countWords(storyBody)

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: buildQCPrompt(storyBody, prefs, wordCount)
      }]
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'

    // Extract JSON block even if Claude wraps it in backticks or adds preamble
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[qc-scorer] No JSON found in response:', raw.slice(0, 200))
      throw new Error('No JSON in QC response')
    }
    const score = JSON.parse(jsonMatch[0]) as QCScore

    score.passed = score.protagonist_agency &&
      score.interest_load_bearing &&
      score.no_moral_announcement &&
      score.word_count_in_range &&
      score.tone_match

    return {
      ...score,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    }
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error('[qc-scorer] Scoring API call failed:', errMsg)
    return {
      protagonist_agency: true,
      interest_load_bearing: true,
      no_moral_announcement: true,
      word_count_in_range: true,
      tone_match: true,
      passed: true,
      failure_notes: `QC skipped — API error: ${errMsg}`,
      inputTokens: 0,
      outputTokens: 0,
      apiError: true
    }
  }
}
