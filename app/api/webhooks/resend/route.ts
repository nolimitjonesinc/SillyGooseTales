import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const events = await req.json()
  const eventArray = Array.isArray(events) ? events : [events]

  for (const event of eventArray) {
    const messageId = event.data?.email_id

    if (!messageId) continue

    switch (event.type) {
      case 'email.opened': {
        // Track open, update churn counter
        await supabaseAdmin
          .from('sillytales_delivery_log')
          .update({ email_opened: true, opened_at: new Date().toISOString() })
          .eq('resend_message_id', messageId)

        // Get subscriber and reset consecutive_unopened_count
        const { data: log } = await supabaseAdmin
          .from('sillytales_delivery_log')
          .select('subscriber_id')
          .eq('resend_message_id', messageId)
          .single()

        if (log) {
          await supabaseAdmin
            .from('sillytales_subscribers')
            .update({ consecutive_unopened_count: 0, subscription_status: 'active' })
            .eq('id', log.subscriber_id)
            .in('subscription_status', ['at_risk', 'active'])
        }
        break
      }

      case 'email.bounced': {
        // Mark email invalid, pause delivery
        const { data: log } = await supabaseAdmin
          .from('sillytales_delivery_log')
          .select('subscriber_id')
          .eq('resend_message_id', messageId)
          .single()

        if (log) {
          await supabaseAdmin
            .from('sillytales_delivery_log')
            .update({ status: 'bounced' })
            .eq('resend_message_id', messageId)

          await supabaseAdmin
            .from('sillytales_subscribers')
            .update({ subscription_status: 'paused' })
            .eq('id', log.subscriber_id)
        }
        break
      }

      case 'email.complained': {
        // Immediately unsubscribe — NEVER email again
        const { data: log } = await supabaseAdmin
          .from('sillytales_delivery_log')
          .select('subscriber_id')
          .eq('resend_message_id', messageId)
          .single()

        if (log) {
          await supabaseAdmin
            .from('sillytales_delivery_log')
            .update({ status: 'complained' })
            .eq('resend_message_id', messageId)

          await supabaseAdmin
            .from('sillytales_subscribers')
            .update({ subscription_status: 'churned' })
            .eq('id', log.subscriber_id)

          // Cancel any queued stories
          await supabaseAdmin
            .from('sillytales_story_queue')
            .update({ status: 'failed' })
            .eq('subscriber_id', log.subscriber_id)
            .eq('status', 'queued')
        }
        break
      }
    }
  }

  return NextResponse.json({ received: true })
}
