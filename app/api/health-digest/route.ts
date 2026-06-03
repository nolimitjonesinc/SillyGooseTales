// Monday 8am UTC — weekly health summary email to admin
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getResend } from '@/lib/clients'
export const maxDuration = 30

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const now = new Date()

  // Delivery stats
  const { data: logs } = await supabaseAdmin
    .from('storydrop_delivery_log')
    .select('status')
    .gte('created_at', sevenDaysAgo)

  const delivered = logs?.filter(l => l.status === 'delivered').length ?? 0
  const bounced = logs?.filter(l => l.status === 'bounced').length ?? 0
  const failed = logs?.filter(l => l.status === 'failed').length ?? 0
  const total = logs?.length ?? 0
  const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0'

  // QC stats
  const { data: queued } = await supabaseAdmin
    .from('storydrop_story_queue')
    .select('status, retry_count, qc_score')
    .gte('created_at', sevenDaysAgo)

  const flagged = queued?.filter(q => q.status === 'flagged').length ?? 0
  const regenerated = queued?.filter(q => (q.retry_count ?? 0) > 0).length ?? 0

  // Subscriber counts
  const { count: activeCount } = await supabaseAdmin
    .from('storydrop_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')

  const { count: atRiskCount } = await supabaseAdmin
    .from('storydrop_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'at_risk')

  const { count: totalCount } = await supabaseAdmin
    .from('storydrop_subscribers')
    .select('*', { count: 'exact', head: true })

  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const allGood = failed === 0 && flagged === 0 && (atRiskCount ?? 0) === 0

  const emailText = `Story Drop — Weekly Health ${dateStr}

📬 Delivery: ${successRate}% success (${delivered} delivered, ${failed} failed, ${bounced} bounced)
⭐ Story quality: ${flagged === 0 ? 'All stories passed QC' : `${flagged} flagged for review`}${regenerated > 0 ? ` (${regenerated} needed regeneration)` : ''}
👥 Subscribers: ${activeCount ?? 0} active${atRiskCount ? ` (${atRiskCount} at risk — 3+ unopened)` : ''} / ${totalCount ?? 0} total
🚩 Flagged stories needing review: ${flagged}${flagged > 0 ? ` → ${appUrl}/admin/review` : ''}
⚠️  Failures: ${failed + bounced > 0 ? `${failed} delivery failures, ${bounced} bounces this week` : 'None'}

${allGood ? 'Everything looks clean. Story Drop is humming.' : `Action needed → ${appUrl}/admin`}
`

  if (process.env.STORYDROP_DRY_RUN === 'true') {
    console.log('[DRY RUN] Health digest:', emailText)
    return NextResponse.json({ dryRun: true })
  }

  await getResend().emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: process.env.ADMIN_EMAIL!,
    subject: `Story Drop — Weekly Health ${dateStr}`,
    text: emailText
  })

  // Churn early warning: increment consecutive_unopened_count for subscribers with no opens this week
  const { data: recentDeliveries } = await supabaseAdmin
    .from('storydrop_delivery_log')
    .select('subscriber_id, email_opened')
    .gte('created_at', sevenDaysAgo)

  if (recentDeliveries) {
    const openedBySubscriber = new Set(
      recentDeliveries.filter(d => d.email_opened).map(d => d.subscriber_id)
    )
    const deliveredTo = new Set(recentDeliveries.map(d => d.subscriber_id))

    for (const subscriberId of deliveredTo) {
      if (!openedBySubscriber.has(subscriberId)) {
        const { data: sub } = await supabaseAdmin
          .from('storydrop_subscribers')
          .select('consecutive_unopened_count, subscription_status')
          .eq('id', subscriberId)
          .single()

        if (!sub || sub.subscription_status === 'churned') continue

        const newCount = (sub.consecutive_unopened_count ?? 0) + 1

        if (newCount >= 3 && sub.subscription_status === 'active') {
          await supabaseAdmin
            .from('storydrop_subscribers')
            .update({ consecutive_unopened_count: newCount, subscription_status: 'at_risk' })
            .eq('id', subscriberId)
        } else {
          await supabaseAdmin
            .from('storydrop_subscribers')
            .update({ consecutive_unopened_count: newCount })
            .eq('id', subscriberId)
        }
      }
    }
  }

  return NextResponse.json({ success: true, delivered, failed, flagged, activeCount })
}
