import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateStory } from '@/lib/story-generator'
import { scoreStory } from '@/lib/qc-scorer'
import { calculateNextDeliveryAt } from '@/lib/scheduling'
import { getResend } from '@/lib/clients'
import type { Preferences } from '@/lib/supabase'

export const maxDuration = 300

const MAX_QC_RETRIES = 5

export async function POST(req: NextRequest) {
  const { subscriberId, overrideDeliveryAt } = await req.json()
  if (!subscriberId) return NextResponse.json({ error: 'subscriberId required' }, { status: 400 })

  // Fetch subscriber + preferences
  const { data: prefs, error } = await supabaseAdmin
    .from('sillytales_preferences')
    .select('*')
    .eq('subscriber_id', subscriberId)
    .single()

  if (error || !prefs) return NextResponse.json({ error: 'Preferences not found' }, { status: 404 })

  const { data: sub } = await supabaseAdmin
    .from('sillytales_subscribers')
    .select('subscription_status')
    .eq('id', subscriberId)
    .single()

  if (!sub || (sub.subscription_status !== 'active' && sub.subscription_status !== 'free_trial')) {
    return NextResponse.json({ error: 'Subscriber not active' }, { status: 400 })
  }

  // Rate limit: max 1 story per 23 hours
  const { count } = await supabaseAdmin
    .from('sillytales_story_queue')
    .select('*', { count: 'exact', head: true })
    .eq('subscriber_id', subscriberId)
    .gte('created_at', new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString())
    .in('status', ['queued', 'delivered'])

  if (count && count > 0) {
    return NextResponse.json({ error: 'Rate limit: story already generated in last 23h' }, { status: 429 })
  }

  const deliveryAt = overrideDeliveryAt ?? calculateNextDeliveryAt(
    prefs.timezone,
    prefs.delivery_day,
    prefs.delivery_slot
  ).toISOString()

  // Generate with QC — up to MAX_QC_RETRIES attempts
  type StoryAttempt = { title: string; body: string; inputTokens: number; outputTokens: number }
  // We always keep the strongest attempt so far (fewest failed criteria), so that
  // even if nothing passes perfectly, the child still gets the best story we wrote.
  let bestStory: StoryAttempt | null = null
  let bestQCScore: Awaited<ReturnType<typeof scoreStory>> | null = null
  let bestFailCount = Infinity
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalQcInputTokens = 0
  let totalQcOutputTokens = 0

  // Accumulate every distinct issue across attempts so a later retry doesn't
  // reintroduce a problem an earlier one already fixed (stops QC whack-a-mole).
  const priorIssues: string[] = []
  let qcFeedback: string | undefined = undefined
  for (let attempt = 0; attempt < MAX_QC_RETRIES; attempt++) {
    let story: { title: string; body: string; inputTokens: number; outputTokens: number }
    try {
      story = await generateStory(prefs as Preferences, qcFeedback)
    } catch (genErr) {
      console.error(`[generate-story] Generation attempt ${attempt + 1} failed:`, genErr)
      continue
    }
    const qcScore = await scoreStory(story.body, prefs as Preferences)
    totalInputTokens += story.inputTokens
    totalOutputTokens += story.outputTokens
    totalQcInputTokens += qcScore.inputTokens
    totalQcOutputTokens += qcScore.outputTokens

    // Remember the strongest attempt (fewest failed checks) as our safety net
    const failCount = [
      qcScore.protagonist_agency,
      qcScore.interest_load_bearing,
      qcScore.no_moral_announcement,
      qcScore.word_count_in_range,
      qcScore.tone_match,
    ].filter(v => v === false).length
    if (failCount < bestFailCount) {
      bestFailCount = failCount
      bestStory = story
      bestQCScore = qcScore
    }

    if (qcScore.passed) {
      if (process.env.SILLYTALES_DRY_RUN === 'true') {
        console.log('[DRY RUN] Would queue story:', story.title, 'for', deliveryAt)
        return NextResponse.json({ dryRun: true, story })
      }

      await supabaseAdmin.from('sillytales_story_queue').insert({
        subscriber_id: subscriberId,
        story_title: story.title,
        story_body: story.body,
        story_token: crypto.randomUUID(),
        delivery_at: deliveryAt,
        status: 'queued',
        qc_score: qcScore,
        input_tokens: totalInputTokens,
        output_tokens: totalOutputTokens,
        qc_input_tokens: totalQcInputTokens,
        qc_output_tokens: totalQcOutputTokens
      })

      // Update next_delivery_at on preferences
      await supabaseAdmin
        .from('sillytales_preferences')
        .update({ next_delivery_at: deliveryAt })
        .eq('subscriber_id', subscriberId)

      return NextResponse.json({ success: true, title: story.title })
    }

    // Failed QC — accumulate the reason so the next attempt fixes ALL known issues
    if (qcScore.failure_notes && !priorIssues.includes(qcScore.failure_notes)) {
      priorIssues.push(qcScore.failure_notes)
    }
    qcFeedback = priorIssues.join('\n')
    console.warn(`[generate-story] Attempt ${attempt + 1} failed QC: ${qcScore.failure_notes}`)
  }

  // No attempt passed QC perfectly — but a child must ALWAYS get a story.
  // Deliver the strongest attempt anyway, and notify admin so it can be reviewed.
  if (bestStory && bestQCScore) {
    if (process.env.SILLYTALES_DRY_RUN === 'true') {
      console.log('[DRY RUN] Would deliver best imperfect story:', bestStory.title)
      return NextResponse.json({ dryRun: true, story: bestStory, imperfect: true })
    }

    await supabaseAdmin.from('sillytales_story_queue').insert({
      subscriber_id: subscriberId,
      story_title: bestStory.title,
      story_body: bestStory.body,
      story_token: crypto.randomUUID(),
      delivery_at: deliveryAt,
      status: 'queued',
      retry_count: MAX_QC_RETRIES,
      qc_score: bestQCScore,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      qc_input_tokens: totalQcInputTokens,
      qc_output_tokens: totalQcOutputTokens
    })

    // Advance the schedule just like the pass path does
    await supabaseAdmin
      .from('sillytales_preferences')
      .update({ next_delivery_at: deliveryAt })
      .eq('subscriber_id', subscriberId)

    // Let admin know it shipped but wasn't a clean pass — review optional, not urgent
    try {
      await getResend().emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: process.env.ADMIN_EMAIL!,
        subject: `Silly Goose Tales: story delivered with minor QC miss (subscriber ${subscriberId})`,
        text: `A story was delivered to subscriber ${subscriberId} after ${MAX_QC_RETRIES} attempts didn't fully pass QC. The best version (${bestFailCount} check${bestFailCount === 1 ? '' : 's'} short) was sent so the child still got a story.\n\nWhat was slightly off: ${bestQCScore.failure_notes}\n\nReview at: ${process.env.NEXT_PUBLIC_APP_URL}/admin/review`
      })
    } catch (mailErr) {
      console.error('[generate-story] Admin notify failed:', mailErr)
    }

    return NextResponse.json({ success: true, title: bestStory.title, imperfect: true })
  }

  // Only reach here if every generation attempt threw before producing any text
  return NextResponse.json({ error: 'Story generation failed entirely — no draft produced' }, { status: 500 })
}
