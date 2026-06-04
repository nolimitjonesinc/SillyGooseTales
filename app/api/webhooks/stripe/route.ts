import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { getStripe } from '@/lib/clients'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Webhook handler writes to Supabase ONLY — no heavy work, stays under 5s
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const subscriberId = session.metadata?.subscriber_id
      if (!subscriberId) break

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active'
        })
        .eq('id', subscriberId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const status = sub.status === 'active' ? 'active' : 'cancelled'

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({ subscription_status: status })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({ subscription_status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
      const subId = typeof invoice.subscription === 'string' ? invoice.subscription : null
      if (!subId) break

      await supabaseAdmin
        .from('sillytales_subscribers')
        .update({ subscription_status: 'paused' })
        .eq('stripe_subscription_id', subId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
