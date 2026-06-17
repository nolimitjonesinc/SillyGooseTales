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
  let lastStory: { title: string; body: string; inputTokens: number; outputTokens: number } | null = null
  let lastQCScore = null
  let passed = false
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalQcInputTokens = 0
  let totalQcOutputTokens = 0

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
    lastStory = story
    lastQCScore = qcScore

    if (qcScore.passed) {
      passed = true

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

    // Failed QC — capture why so the next attempt can fix that exact problem
    qcFeedback = qcScore.failure_notes
    console.warn(`[generate-story] Attempt ${attempt + 1} failed QC: ${qcScore.failure_notes}`)
  }

  // All attempts failed — flag for admin
  if (lastStory && lastQCScore) {
    await supabaseAdmin.from('sillytales_story_queue').insert({
      subscriber_id: subscriberId,
      story_title: lastStory.title,
      story_body: lastStory.body,
      story_token: crypto.randomUUID(),
      delivery_at: deliveryAt,
      status: 'flagged',
      retry_count: MAX_QC_RETRIES,
      qc_score: lastQCScore,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      qc_input_tokens: totalQcInputTokens,
      qc_output_tokens: totalQcOutputTokens
    })

    // Alert admin
    await getResend().emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL!,
      subject: `Silly Goose Tales: QC failed for subscriber ${subscriberId}`,
      text: `A story for subscriber ${subscriberId} failed QC ${MAX_QC_RETRIES} times and has been flagged for review.\n\nFailure notes: ${lastQCScore.failure_notes}\n\nReview at: ${process.env.NEXT_PUBLIC_APP_URL}/admin/review`
    })
  }

  return NextResponse.json({ error: 'Story failed QC after max retries — flagged for admin' }, { status: 422 })
}
