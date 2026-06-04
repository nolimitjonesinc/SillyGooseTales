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
    toneProfile,
    deliveryDay,
    deliverySlot,
    timezone
  } = body

  if (!subscriberId || !childName || !childAge || !interests?.length || !toneProfile) {
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
      tone_profile: toneProfile,
      delivery_day: deliveryDay ?? 'friday',
      delivery_slot: deliverySlot ?? 'evening',
      timezone: timezone ?? 'America/New_York',
      next_delivery_at: nextDeliveryAt.toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'subscriber_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger a sample story immediately
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const sampleDelivery = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

  fetch(`${appUrl}/api/generate-story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriberId,
      overrideDeliveryAt: sampleDelivery.toISOString()
    })
  }).catch(err => console.error('[onboarding] Sample story generation failed:', err))

  return NextResponse.json({ success: true, nextDeliveryAt: nextDeliveryAt.toISOString() })
}
