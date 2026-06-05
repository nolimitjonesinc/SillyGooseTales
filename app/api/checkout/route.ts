import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { supabaseAdmin } from '@/lib/supabase'
import { initLemonSqueezy } from '@/lib/clients'

export async function POST(req: NextRequest) {
  initLemonSqueezy()

  const { email, plan, subscriberId } = await req.json()

  const variantId = plan === 'annual'
    ? Number(process.env.LEMONSQUEEZY_VARIANT_ID_ANNUAL!)
    : Number(process.env.LEMONSQUEEZY_VARIANT_ID_MONTHLY!)

  const storeId = Number(process.env.LEMONSQUEEZY_STORE_ID!)

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

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: email.toLowerCase(),
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
