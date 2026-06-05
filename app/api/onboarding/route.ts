import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateNextDeliveryAt } from '@/lib/scheduling'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    subscriberId,
    childName,
    childAge,
    interests,
    themesInclude,
    themesExclude,
    toneProfiles,
    deliveryDay,
    deliverySlot,
    timezone
  } = body

  if (!subscriberId || !childName || !childAge || !interests?.length || !toneProfiles?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const nextDeliveryAt = calculateNextDeliveryAt(timezone ?? 'America/New_York', deliveryDay ?? 'friday', deliverySlot ?? 'evening')

  const { error } = await supabaseAdmin
    .from('sillytales_preferences')
    .upsert({
      subscriber_id: subscriberId,
      child_name: childName,
      child_age: parseInt(childAge),
      interests,
      themes_include: themesInclude ?? [],
      themes_exclude: themesExclude ?? [],
      tone_profile: toneProfiles[0],
      tone_profiles: toneProfiles,
      delivery_day: deliveryDay ?? 'friday',
      delivery_slot: deliverySlot ?? 'evening',
      timezone: timezone ?? 'America/New_York',
      next_delivery_at: nextDeliveryAt.toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'subscriber_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger a welcome story — awaited so Vercel doesn't kill it before it completes
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  try {
    await fetch(`${appUrl}/api/generate-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriberId,
        overrideDeliveryAt: new Date().toISOString()
      })
    })
  } catch (err) {
    console.error('[onboarding] Welcome story generation failed:', err)
  }

  return NextResponse.json({ success: true, nextDeliveryAt: nextDeliveryAt.toISOString() })
}
