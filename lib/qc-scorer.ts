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

3. no_moral_announcement: Does the story avoid stating its lesson, theme, or moral explicitly as dialogue or narration? (false if any character says something like "and that's why..." or the narrator summarizes a lesson)

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

export async function scoreStory(
  storyBody: string,
  prefs: Preferences
): Promise<QCScore> {
  const wordCount = countWords(storyBody)

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: buildQCPrompt(storyBody, prefs, wordCount)
      }]
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const score = JSON.parse(raw.trim()) as QCScore

    // Ensure passed is correctly set (don't trust model's calculation)
    score.passed = score.protagonist_agency &&
      score.interest_load_bearing &&
      score.no_moral_announcement &&
      score.word_count_in_range &&
      score.tone_match

    return score
  } catch {
    // If QC call fails, fail safe — don't queue a potentially bad story
    return {
      protagonist_agency: false,
      interest_load_bearing: false,
      no_moral_announcement: true,
      word_count_in_range: false,
      tone_match: false,
      passed: false,
      failure_notes: 'QC scoring call failed — story flagged as precaution'
    }
  }
}
