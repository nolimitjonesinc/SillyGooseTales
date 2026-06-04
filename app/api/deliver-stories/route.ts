// Vercel Cron: every 5 minutes — delivers queued stories that are due
// Stolen from Mockingbird's getNextQueueItem pattern, adapted for Supabase + Resend
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getResend } from '@/lib/clients'
import { StoryEmail } from '@/emails/StoryEmail'
import { generateMagicToken } from '@/lib/magic-tokens'
import { calculateNextDeliveryAt } from '@/lib/scheduling'
export const maxDuration = 30

export async function GET() {
  const now = new Date().toISOString()

  // Find due stories (getNextQueueItem pattern from Mockingbird)
  const { data: dueStories, error } = await supabaseAdmin
    .from('sillytales_story_queue')
    .select('*')
    .lte('delivery_at', now)
    .eq('status', 'queued')
    .order('delivery_at', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!dueStories?.length) return NextResponse.json({ delivered: 0, message: 'No stories due' })

  let delivered = 0
  let failed = 0

  for (const story of dueStories) {
    try {
      // Get subscriber email + preferences
      const { data: sub } = await supabaseAdmin
        .from('sillytales_subscribers')
        .select('id, email, subscription_status')
        .eq('id', story.subscriber_id)
        .single()

      if (!sub || !['active', 'free_trial'].includes(sub.subscription_status)) {
        await supabaseAdmin
          .from('sillytales_story_queue')
          .update({ status: 'failed' })
          .eq('id', story.id)
        continue
      }

      const { data: prefs } = await supabaseAdmin
        .from('sillytales_preferences')
        .select('child_name, child_age, delivery_day, delivery_slot, timezone')
        .eq('subscriber_id', story.subscriber_id)
        .single()

      if (!prefs) continue

      // Generate magic token for preference/pause/unsub links
      const magicToken = await generateMagicToken(sub.id)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

      if (process.env.SILLYTALES_DRY_RUN === 'true') {
        console.log('[DRY RUN] Would send:', story.story_title, 'to', sub.email)
        await supabaseAdmin.from('sillytales_story_queue').update({ status: 'delivered' }).eq('id', story.id)
        delivered++
        continue
      }

      // First 2 paragraphs as the email teaser
      const storyPreview = story.story_body
        .split('\n\n')
        .filter(Boolean)
        .slice(0, 2)
        .join('\n\n')

      const storyPageUrl = `${baseUrl}/story/${story.story_token}`

      const { data: emailData, error: emailError } = await getResend().emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: sub.email,
        subject: `${prefs.child_name}'s story is here — ${story.story_title}`,
        headers: {
          'List-Unsubscribe': `<${baseUrl}/unsubscribe?token=${magicToken}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        react: StoryEmail({
          childName: prefs.child_name,
          storyTitle: story.story_title,
          storyPreview,
          storyPageUrl,
          preferencesUrl: `${baseUrl}/preferences?token=${magicToken}`,
          pauseUrl: `${baseUrl}/pause?token=${magicToken}`,
          unsubUrl: `${baseUrl}/unsubscribe?token=${magicToken}`,
          moodBaseUrl: `${baseUrl}/api/set-mood?token=${magicToken}`
        })
      })

      if (emailError) throw new Error(emailError.message)

      // Mark delivered
      await supabaseAdmin
        .from('sillytales_story_queue')
        .update({ status: 'delivered' })
        .eq('id', story.id)

      // Log delivery
      await supabaseAdmin.from('sillytales_delivery_log').insert({
        subscriber_id: story.subscriber_id,
        story_queue_id: story.id,
        story_title: story.story_title,
        delivered_at: new Date().toISOString(),
        resend_message_id: emailData?.id,
        status: 'delivered'
      })

      // Update story_history (keep last 10)
      const { data: currentPrefs } = await supabaseAdmin
        .from('sillytales_preferences')
        .select('story_history')
        .eq('subscriber_id', story.subscriber_id)
        .single()

      const history = currentPrefs?.story_history ?? []
      const updatedHistory = [...history, story.story_title].slice(-10)

      // Schedule next delivery and update history
      const nextDelivery = calculateNextDeliveryAt(prefs.timezone, prefs.delivery_day, prefs.delivery_slot)
      await supabaseAdmin
        .from('sillytales_preferences')
        .update({
          story_history: updatedHistory,
          next_delivery_at: nextDelivery.toISOString()
        })
        .eq('subscriber_id', story.subscriber_id)

      delivered++
    } catch (err) {
      console.error(`[deliver-stories] Failed for story ${story.id}:`, err)

      const newRetryCount = (story.retry_count ?? 0) + 1

      if (newRetryCount >= 3) {
        // Abandon — alert admin
        await supabaseAdmin
          .from('sillytales_story_queue')
          .update({ status: 'failed', retry_count: newRetryCount })
          .eq('id', story.id)

        await getResend().emails.send({
          from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
          to: process.env.ADMIN_EMAIL!,
          subject: `Silly Goose Tales: delivery failed 3x for subscriber ${story.subscriber_id}`,
          text: `Story "${story.story_title}" failed to deliver after 3 attempts.\nSubscriber: ${story.subscriber_id}\nStory ID: ${story.id}`
        })
      } else {
        await supabaseAdmin
          .from('sillytales_story_queue')
          .update({ retry_count: newRetryCount })
          .eq('id', story.id)
      }

      failed++
    }
  }

  return NextResponse.json({ delivered, failed, total: dueStories.length })
}
