import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-signature')

  if (!signature || !verifySignature(body, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const eventName = event.meta?.event_name
  const subscriberId = event.meta?.custom_data?.subscriber_id

  switch (eventName) {
    case 'order_created': {
      if (!subscriberId) break
      const customerId = String(event.data?.attributes?.customer_id ?? '')
      const subscriptionId = String(event.data?.id ?? '')

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({
          lemonsqueezy_customer_id: customerId,
          lemonsqueezy_subscription_id: subscriptionId,
          subscription_status: 'active'
        })
        .eq('id', subscriberId)
      break
    }

    case 'subscription_created': {
      if (!subscriberId) break
      const customerId = String(event.data?.attributes?.customer_id ?? '')
      const subscriptionId = String(event.data?.id ?? '')

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({
          lemonsqueezy_customer_id: customerId,
          lemonsqueezy_subscription_id: subscriptionId,
          subscription_status: 'active'
        })
        .eq('id', subscriberId)
      break
    }

    case 'subscription_updated': {
      const status = event.data?.attributes?.status
      const subId = String(event.data?.id ?? '')
      if (!subId) break

      const mappedStatus = status === 'active' ? 'active' : 'cancelled'
      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({ subscription_status: mappedStatus })
        .eq('lemonsqueezy_subscription_id', subId)
      break
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      const subId = String(event.data?.id ?? '')
      if (!subId) break

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({ subscription_status: 'cancelled' })
        .eq('lemonsqueezy_subscription_id', subId)
      break
    }

    case 'subscription_payment_failed': {
      const subId = String(event.data?.attributes?.subscription_id ?? '')
      if (!subId) break

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({ subscription_status: 'paused' })
        .eq('lemonsqueezy_subscription_id', subId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
