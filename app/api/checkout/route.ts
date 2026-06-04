import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getStripe } from '@/lib/clients'

export async function POST(req: NextRequest) {
  const { email, plan, subscriberId } = await req.json()

  const priceId = plan === 'annual'
    ? process.env.STRIPE_PRICE_ID_ANNUAL!
    : process.env.STRIPE_PRICE_ID_MONTHLY!

  // Get or create subscriber
  let subId = subscriberId
  if (!subId) {
    const { data } = await supabaseAdmin
      .from('sillytales_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()
    subId = data?.id
  }

  if (!subId) {
    const { data, error } = await supabaseAdmin
      .from('sillytales_subscribers')
      .insert({ email: email.toLowerCase(), subscription_status: 'free_trial' })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    subId = data.id
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}&subscriber_id=${subId}`,
    cancel_url: `${appUrl}/?cancelled=1`,
    customer_email: email.toLowerCase(),
    metadata: { subscriber_id: subId },
    subscription_data: {
      metadata: { subscriber_id: subId }
    }
  })

  return NextResponse.json({ url: session.url })
}
