import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { supabaseAdmin } from '@/lib/supabase'
import { initLemonSqueezy } from '@/lib/clients'

export async function POST(req: NextRequest) {
  initLemonSqueezy()

  const { email: emailInput, plan, subscriberId } = await req.json()

  const variantId = plan === 'annual'
    ? Number(process.env.LEMONSQUEEZY_VARIANT_ID_ANNUAL!)
    : Number(process.env.LEMONSQUEEZY_VARIANT_ID_MONTHLY!)

  const storeId = Number(process.env.LEMONSQUEEZY_STORE_ID!)

  let subId = subscriberId
  let resolvedEmail: string = emailInput?.toLowerCase() ?? ''

  if (subId) {
    // Came from story page upgrade — look up email from subscriber record
    const { data } = await supabaseAdmin
      .from('sillytales_subscribers')
      .select('id, email')
      .eq('id', subId)
      .single()
    if (data) resolvedEmail = data.email
  } else {
    // Came from signup form — look up or create subscriber by email
    const { data: existing } = await supabaseAdmin
      .from('sillytales_subscribers')
      .select('id')
      .eq('email', resolvedEmail)
      .single()
    subId = existing?.id

    if (!subId) {
      const { data: newSub, error } = await supabaseAdmin
        .from('sillytales_subscribers')
        .insert({ email: resolvedEmail, subscription_status: 'free_trial' })
        .select('id')
        .single()
      if (error) return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      subId = newSub.id
    }
  }

  if (!subId || !resolvedEmail) {
    return NextResponse.json({ error: 'Could not resolve subscriber' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: resolvedEmail,
      custom: { subscriber_id: subId }
    },
    productOptions: {
      redirectUrl: `${appUrl}/onboarding?subscriber_id=${subId}`,
      receiptLinkUrl: `${appUrl}/`,
    }
  })

  if (error || !data?.data?.attributes?.url) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }

  return NextResponse.json({ url: data.data.attributes.url })
}
