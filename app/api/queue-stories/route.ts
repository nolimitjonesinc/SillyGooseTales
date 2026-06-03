// Daily cron at 6am UTC — pre-generates stories for subscribers due in next 24h
// Stolen from Mockingbird News Bot's queue pattern, adapted for Supabase + email
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

export async function GET() {
  // Find all active subscribers with next_delivery_at in the next 24 hours
  // who don't already have a queued story
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data: subscribers, error } = await supabaseAdmin
    .from('storydrop_preferences')
    .select('subscriber_id, next_delivery_at')
    .not('next_delivery_at', 'is', null)
    .gte('next_delivery_at', now.toISOString())
    .lte('next_delivery_at', in24h.toISOString())

  if (error) {
    console.error('[queue-stories] Error fetching subscribers:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!subscribers?.length) {
    return NextResponse.json({ processed: 0, message: 'No stories due in next 24h' })
  }

  // Filter out subscribers who already have a queued story for this window
  const { data: alreadyQueued } = await supabaseAdmin
    .from('storydrop_story_queue')
    .select('subscriber_id')
    .in('subscriber_id', subscribers.map(s => s.subscriber_id))
    .gte('delivery_at', now.toISOString())
    .lte('delivery_at', in24h.toISOString())
    .in('status', ['queued', 'delivered'])

  const alreadyQueuedIds = new Set(alreadyQueued?.map(q => q.subscriber_id) ?? [])
  const toGenerate = subscribers.filter(s => !alreadyQueuedIds.has(s.subscriber_id))

  if (!toGenerate.length) {
    return NextResponse.json({ processed: 0, message: 'All due subscribers already have stories queued' })
  }

  // Also verify subscribers are active
  const { data: activeStatuses } = await supabaseAdmin
    .from('storydrop_subscribers')
    .select('id, subscription_status')
    .in('id', toGenerate.map(s => s.subscriber_id))
    .in('subscription_status', ['active'])

  const activeIds = new Set(activeStatuses?.map(s => s.id) ?? [])

  let processed = 0
  let failed = 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  for (const sub of toGenerate) {
    if (!activeIds.has(sub.subscriber_id)) continue

    try {
      const res = await fetch(`${appUrl}/api/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: sub.subscriber_id,
          overrideDeliveryAt: sub.next_delivery_at
        })
      })

      if (res.ok) {
        processed++
      } else {
        failed++
        console.error(`[queue-stories] Failed to generate for ${sub.subscriber_id}:`, await res.text())
      }
    } catch (err) {
      failed++
      console.error(`[queue-stories] Exception for ${sub.subscriber_id}:`, err)
    }
  }

  return NextResponse.json({ processed, failed, total: toGenerate.length })
}
