// Free tier signup — no credit card, no account, story arrives tonight
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateMagicToken } from '@/lib/magic-tokens'
import { calculateNextDeliveryAt } from '@/lib/scheduling'

export async function POST(req: NextRequest) {
  const { childName, childAge, interest, toneProfile, email } = await req.json()

  if (!childName || !childAge || !interest || !toneProfile || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Simple email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Honeypot check (field populated by bots)
  const body = await req.text().catch(() => '')
  if (body.includes('"website"')) {
    return NextResponse.json({ success: true }) // Silently succeed for bots
  }

  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from('sillytales_subscribers')
    .select('id, subscription_status')
    .eq('email', email.toLowerCase())
    .single()

  let subscriberId: string

  if (existing) {
    subscriberId = existing.id
    // If already active/paid, don't downgrade
    if (existing.subscription_status === 'active') {
      return NextResponse.json({ error: 'Already subscribed — check your email for login link' }, { status: 409 })
    }
  } else {
    // Create subscriber
    const { data: newSub, error } = await supabaseAdmin
      .from('sillytales_subscribers')
      .insert({
        email: email.toLowerCase(),
        subscription_status: 'free_trial'
      })
      .select('id')
      .single()

    if (error || !newSub) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
    subscriberId = newSub.id
  }

  // Detect timezone from request headers (rough fallback)
  const timezone = 'America/New_York'

  // Tonight delivery — find next evening slot
  const deliveryAt = calculateNextDeliveryAt(timezone, new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(), 'evening')

  // Fetch existing interests so custom ones accumulate over time
  const { data: existingPrefs } = await supabaseAdmin
    .from('sillytales_preferences')
    .select('interests')
    .eq('subscriber_id', subscriberId)
    .single()

  const existingInterests: string[] = existingPrefs?.interests ?? []
  const updatedInterests = existingInterests.includes(interest)
    ? existingInterests
    : [...existingInterests, interest]

  // Create minimal preferences
  await supabaseAdmin
    .from('sillytales_preferences')
    .upsert({
      subscriber_id: subscriberId,
      child_name: childName,
      child_age: childAge,
      interests: updatedInterests,
      tone_profile: toneProfile,
      delivery_day: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      delivery_slot: 'evening',
      timezone,
      next_delivery_at: deliveryAt.toISOString()
    }, { onConflict: 'subscriber_id' })

  // Generate the free story (non-blocking)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  fetch(`${appUrl}/api/generate-story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriberId, overrideDeliveryAt: deliveryAt.toISOString() })
  }).catch(err => console.error('[subscribe] Background generation failed:', err))

  const magicToken = await generateMagicToken(subscriberId)

  return NextResponse.json({
    success: true,
    magicToken,
    message: `${childName}'s story will arrive tonight`
  })
}
