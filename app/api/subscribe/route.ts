// Free tier signup — no credit card, no account, story arrives tonight
import { NextRequest, NextResponse, after } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateMagicToken } from '@/lib/magic-tokens'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { childName, childAge, interests: interestsInput, interest: interestLegacy, toneProfile, email, website } = body

    // Accept either interests[] (new) or interest string (legacy)
    const incomingInterests: string[] = Array.isArray(interestsInput)
      ? interestsInput
      : interestLegacy ? [interestLegacy] : []

    if (!childName || !childAge || incomingInterests.length === 0 || !toneProfile || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Honeypot check (field populated by bots)
    if (website) {
      return NextResponse.json({ success: true })
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
      if (existing.subscription_status === 'active') {
        return NextResponse.json({ error: 'Already subscribed — check your email for login link' }, { status: 409 })
      }
    } else {
      const { data: newSub, error } = await supabaseAdmin
        .from('sillytales_subscribers')
        .insert({
          email: email.toLowerCase(),
          subscription_status: 'free_trial'
        })
        .select('id')
        .single()

      if (error || !newSub) {
        console.error('[subscribe] Insert failed:', error)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }
      subscriberId = newSub.id
    }

    // Free trial: deliver within 10 minutes. Don't use the scheduled slot — that
    // puts stories 7 days out if the user signs up after tonight's delivery time.
    const deliveryAt = new Date(Date.now() + 10 * 60 * 1000)

    const { data: existingPrefs } = await supabaseAdmin
      .from('sillytales_preferences')
      .select('interests')
      .eq('subscriber_id', subscriberId)
      .single()

    const existingInterests: string[] = existingPrefs?.interests ?? []
    const merged = [...existingInterests]
    for (const i of incomingInterests) {
      if (!merged.includes(i)) merged.push(i)
    }
    const updatedInterests = merged

    const { error: prefError } = await supabaseAdmin
      .from('sillytales_preferences')
      .upsert({
        subscriber_id: subscriberId,
        child_name: childName,
        child_age: childAge,
        interests: updatedInterests,
        tone_profile: toneProfile,
        delivery_day: 'daily',
        delivery_slot: 'evening',
        timezone: 'America/New_York',
        next_delivery_at: deliveryAt.toISOString()
      }, { onConflict: 'subscriber_id' })

    if (prefError) {
      console.error('[subscribe] Preferences upsert failed:', prefError)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    const magicToken = await generateMagicToken(subscriberId)

    // Kick off story generation in the background so the signup response returns
    // immediately. The story is delivered by the deliver-stories cron within minutes,
    // so the user never needs to wait on the AI write here.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (appUrl) {
      after(async () => {
        try {
          await fetch(`${appUrl}/api/generate-story`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriberId, overrideDeliveryAt: new Date().toISOString() })
          })
        } catch (err) {
          console.error('[subscribe] Story generation failed:', err)
        }
      })
    }

    return NextResponse.json({
      success: true,
      magicToken,
      message: `${childName}'s story will arrive tonight`
    })
  } catch (err) {
    console.error('[subscribe] Unhandled error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
