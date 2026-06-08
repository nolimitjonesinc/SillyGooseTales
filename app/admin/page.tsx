import { supabaseAdmin } from '@/lib/supabase'
import { AdminActions } from './AdminActions'
import { SubscriberTable } from './SubscriberTable'
import { AdminFlaggedStories } from './AdminFlaggedStories'
import type { SubscriberRow } from './SubscriberTable'

export const dynamic = 'force-dynamic'

// Haiku 3.5 pricing — verify at anthropic.com/pricing
const COST_PER_INPUT_TOKEN = 0.80 / 1_000_000
const COST_PER_OUTPUT_TOKEN = 4.00 / 1_000_000

function calcCost(inputTokens: number, outputTokens: number, qcIn: number, qcOut: number): number {
  return (inputTokens + qcIn) * COST_PER_INPUT_TOKEN + (outputTokens + qcOut) * COST_PER_OUTPUT_TOKEN
}

function StatCard({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border-2 ${warn ? 'border-amber-300 bg-amber-50' : 'bg-white border-[#e8ddd0]'}`}>
      <p className="text-xs text-[#aaa] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${warn ? 'text-amber-700' : 'text-[#2C2A26]'}`}>{value}</p>
    </div>
  )
}

export default async function AdminPage() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)

  const [
    { count: activeCount },
    { count: trialCount },
    { count: atRiskCount },
    { count: totalCount },
    { count: queuedCount },
    { data: recentLogs },
    { data: flaggedStories },
    { data: queuedStories },
    { data: allSubscribers },
    { data: allPrefs },
    { data: allDeliveryLogs },
    { data: allQueueItems },
    { data: todayItems },
    { data: lastDelivery },
    { data: lastQueued },
    { data: recentOrders },
    { count: monthlySubCount },
    { count: annualSubCount },
  ] = await Promise.all([
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'free_trial'),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'at_risk'),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('sillytales_story_queue').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
    supabaseAdmin.from('sillytales_delivery_log').select('status, email_opened, subscriber_id').gte('created_at', sevenDaysAgo),
    supabaseAdmin.from('sillytales_story_queue').select('id, subscriber_id, story_title, qc_score, created_at').eq('status', 'flagged').order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('sillytales_story_queue').select('id, subscriber_id, story_title, delivery_at').eq('status', 'queued').order('delivery_at', { ascending: true }).limit(15),
    supabaseAdmin.from('sillytales_subscribers').select('id, email, subscription_status').not('subscription_status', 'in', '("churned","cancelled")').order('created_at', { ascending: false }),
    supabaseAdmin.from('sillytales_preferences').select('subscriber_id, child_name, child_age'),
    supabaseAdmin.from('sillytales_delivery_log').select('subscriber_id, status, email_opened, delivered_at'),
    supabaseAdmin.from('sillytales_story_queue').select('subscriber_id, input_tokens, output_tokens, qc_input_tokens, qc_output_tokens, created_at').in('status', ['delivered', 'queued', 'flagged']),
    supabaseAdmin.from('sillytales_story_queue').select('input_tokens, output_tokens, qc_input_tokens, qc_output_tokens').gte('created_at', todayStart.toISOString()),
    supabaseAdmin.from('sillytales_delivery_log').select('created_at').order('created_at', { ascending: false }).limit(1),
    supabaseAdmin.from('sillytales_story_queue').select('created_at').order('created_at', { ascending: false }).limit(1),
    supabaseAdmin.from('sillytales_orders').select('amount_cents, plan_type, created_at').order('created_at', { ascending: false }).limit(200),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('plan_type', 'monthly'),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('plan_type', 'annual'),
  ])

  // --- Delivery stats ---
  const delivered7d = recentLogs?.filter(l => l.status === 'delivered').length ?? 0
  const failed7d = recentLogs?.filter(l => l.status === 'failed' || l.status === 'bounced').length ?? 0
  const opened7d = recentLogs?.filter(l => l.email_opened).length ?? 0
  const total7d = recentLogs?.length ?? 0
  const successRate = total7d > 0 ? `${((delivered7d / total7d) * 100).toFixed(1)}%` : '—'
  const openRate = delivered7d > 0 ? `${((opened7d / delivered7d) * 100).toFixed(1)}%` : '—'

  // --- Cost stats ---
  const weekCost = (allQueueItems ?? []).reduce((sum, item) => {
    const createdAt = new Date(item.created_at)
    if (createdAt >= new Date(sevenDaysAgo)) {
      return sum + calcCost(item.input_tokens ?? 0, item.output_tokens ?? 0, item.qc_input_tokens ?? 0, item.qc_output_tokens ?? 0)
    }
    return sum
  }, 0)

  const todayCost = (todayItems ?? []).reduce((sum, item) =>
    sum + calcCost(item.input_tokens ?? 0, item.output_tokens ?? 0, item.qc_input_tokens ?? 0, item.qc_output_tokens ?? 0), 0)

  const projectedMonthly = weekCost * 4.3
  const totalStories = allQueueItems?.length ?? 0
  const allTimeCost = (allQueueItems ?? []).reduce((sum, item) =>
    sum + calcCost(item.input_tokens ?? 0, item.output_tokens ?? 0, item.qc_input_tokens ?? 0, item.qc_output_tokens ?? 0), 0)
  const avgCostPerStory = totalStories > 0 ? allTimeCost / totalStories : 0
  const activeTotal = (activeCount ?? 0) + (trialCount ?? 0)
  const costPerSubPerMonth = activeTotal > 0 ? projectedMonthly / activeTotal : 0

  // --- Per-subscriber table ---
  const prefsMap = new Map((allPrefs ?? []).map(p => [p.subscriber_id, p]))

  const queueBySubscriber = new Map<string, { stories: number; costUsd: number; lastDate: string | null }>()
  for (const item of allQueueItems ?? []) {
    const existing = queueBySubscriber.get(item.subscriber_id) ?? { stories: 0, costUsd: 0, lastDate: null }
    existing.stories++
    existing.costUsd += calcCost(item.input_tokens ?? 0, item.output_tokens ?? 0, item.qc_input_tokens ?? 0, item.qc_output_tokens ?? 0)
    if (!existing.lastDate || item.created_at > existing.lastDate) existing.lastDate = item.created_at
    queueBySubscriber.set(item.subscriber_id, existing)
  }

  const logsBySubscriber = new Map<string, { delivered: number; opened: number }>()
  for (const log of allDeliveryLogs ?? []) {
    const existing = logsBySubscriber.get(log.subscriber_id) ?? { delivered: 0, opened: 0 }
    if (log.status === 'delivered') existing.delivered++
    if (log.email_opened) existing.opened++
    logsBySubscriber.set(log.subscriber_id, existing)
  }

  const subscriberRows: SubscriberRow[] = (allSubscribers ?? []).map(sub => {
    const prefs = prefsMap.get(sub.id)
    const queue = queueBySubscriber.get(sub.id) ?? { stories: 0, costUsd: 0, lastDate: null }
    const logs = logsBySubscriber.get(sub.id) ?? { delivered: 0, opened: 0 }
    return {
      id: sub.id,
      email: sub.email,
      status: sub.subscription_status,
      childName: prefs?.child_name ?? '—',
      childAge: prefs?.child_age ?? 0,
      storiesDelivered: logs.delivered,
      totalCostUsd: queue.costUsd,
      lastStoryDate: queue.lastDate,
      opensOut: logs.opened,
      deliveredCount: logs.delivered,
    }
  })

  // --- Conversion rate ---
  const paidCount = activeCount ?? 0
  const totalSignups = totalCount ?? 0
  const conversionRate = totalSignups > 0 ? `${((paidCount / totalSignups) * 100).toFixed(0)}%` : '—'

  // --- Pipeline timing ---
  function timeAgo(isoDate: string | null | undefined): string {
    if (!isoDate) return 'Never'
    const diff = now.getTime() - new Date(isoDate).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }
  const lastDeliveryRun = lastDelivery?.[0]?.created_at ?? null
  const lastQueueRun = lastQueued?.[0]?.created_at ?? null

  // --- Revenue ---
  const monthlyMRR = (monthlySubCount ?? 0) * 9.99
  const annualMRR = (annualSubCount ?? 0) * (89.99 / 12)
  const totalMRR = monthlyMRR + annualMRR
  const totalRevenue = (recentOrders ?? [])
    .filter(o => o.plan_type)
    .reduce((sum, o) => sum + (o.amount_cents ?? 0), 0) / 100
  const newPaidThisWeek = (recentOrders ?? [])
    .filter(o => new Date(o.created_at) >= new Date(sevenDaysAgo)).length

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <main className="min-h-screen bg-[#FDF6EE] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#2C2A26]" style={{ fontFamily: 'Georgia, serif' }}>
            Silly Goose Tales
          </h1>
          <p className="text-[#aaa] text-sm mt-1">{dateStr}</p>
        </div>

        {/* Overview strip */}
        <section>
          <h2 className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-3">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Paying subscribers" value={activeCount ?? 0} />
            <StatCard label="Free trial" value={trialCount ?? 0} />
            <StatCard label="Disengaged (3+ ignored)" value={atRiskCount ?? 0} warn={(atRiskCount ?? 0) > 0} />
            <StatCard label="Total signups" value={totalCount ?? 0} />
            <StatCard label="Trial → paid conversion" value={conversionRate} />
            <StatCard label="Delivery success (7 days)" value={successRate} warn={successRate !== '—' && parseFloat(successRate) < 98} />
            <StatCard label="Email open rate (7 days)" value={openRate} />
            <StatCard label="Stories in queue" value={queuedCount ?? 0} />
            <StatCard label="Flagged — need review" value={flaggedStories?.length ?? 0} warn={(flaggedStories?.length ?? 0) > 0} />
            <StatCard label="Failures this week" value={failed7d} warn={failed7d > 0} />
          </div>
        </section>

        {/* Cost panel */}
        <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-5">Claude API Cost</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs text-[#aaa] mb-1">Today</p>
              <p className="text-3xl font-bold text-[#2C2A26]">${todayCost.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-[#aaa] mb-1">This week</p>
              <p className="text-3xl font-bold text-[#2C2A26]">${weekCost.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-[#aaa] mb-1">Projected this month</p>
              <p className="text-3xl font-bold text-[#E8A838]">${projectedMonthly.toFixed(2)}</p>
            </div>
          </div>
          <div className="border-t border-[#f0e8dc] pt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-[#5a5550]">
            <p><span className="font-medium text-[#2C2A26]">{totalStories}</span> stories generated all-time</p>
            <p>Avg <span className="font-medium text-[#2C2A26]">${avgCostPerStory.toFixed(4)}</span> per story</p>
            <p><span className="font-medium text-[#2C2A26]">${costPerSubPerMonth.toFixed(3)}</span> per subscriber per month</p>
          </div>
          <p className="text-xs text-[#ccc] mt-3">Based on Haiku 3.5 pricing. Verify rates at anthropic.com/pricing.</p>
        </section>

        {/* Subscriber table */}
        <SubscriberTable rows={subscriberRows} />

        {/* Pipeline status */}
        <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-4">Pipeline Status</h2>
          <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
            <div className="bg-[#f9f5f0] rounded-xl px-4 py-3">
              <p className="text-xs text-[#aaa] mb-1">Last story queued</p>
              <p className="font-semibold text-[#2C2A26]">{timeAgo(lastQueueRun)}</p>
            </div>
            <div className="bg-[#f9f5f0] rounded-xl px-4 py-3">
              <p className="text-xs text-[#aaa] mb-1">Last story delivered</p>
              <p className="font-semibold text-[#2C2A26]">{timeAgo(lastDeliveryRun)}</p>
            </div>
          </div>
          {queuedStories && queuedStories.length > 0 ? (
            <>
              <p className="text-xs text-[#aaa] uppercase tracking-widest mb-3">
                Queued and waiting ({queuedStories.length})
              </p>
              <div className="space-y-2">
                {queuedStories.map(story => {
                  const prefs = prefsMap.get(story.subscriber_id)
                  const deliveryDate = new Date(story.delivery_at)
                  const when = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  const time = deliveryDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                  return (
                    <div key={story.id} className="flex items-center justify-between py-2 border-b border-[#f0e8dc] last:border-0">
                      <div>
                        <span className="font-medium text-[#2C2A26] text-sm">{story.story_title}</span>
                        {prefs && <span className="text-xs text-[#aaa] ml-2">for {prefs.child_name}</span>}
                      </div>
                      <span className="text-xs text-[#5a5550] bg-[#f5ede2] px-2 py-1 rounded">{when} at {time}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#aaa]">Nothing queued right now.</p>
          )}
        </section>

        {/* Revenue panel */}
        <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-5">Revenue</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
            <div>
              <p className="text-xs text-[#aaa] mb-1">MRR (est.)</p>
              <p className="text-3xl font-bold text-[#2C2A26]">${totalMRR.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-[#aaa] mb-1">Monthly subscribers</p>
              <p className="text-3xl font-bold text-[#2C2A26]">{monthlySubCount ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-[#aaa] mb-1">Annual subscribers</p>
              <p className="text-3xl font-bold text-[#2C2A26]">{annualSubCount ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-[#aaa] mb-1">New paid this week</p>
              <p className="text-3xl font-bold text-[#E8A838]">{newPaidThisWeek}</p>
            </div>
          </div>
          <div className="border-t border-[#f0e8dc] pt-4 text-sm text-[#5a5550]">
            <p>Total logged revenue: <span className="font-medium text-[#2C2A26]">${totalRevenue.toFixed(2)}</span>
              <span className="text-xs text-[#ccc] ml-2">(from orders table — grows as new subscribers checkout)</span>
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <AdminActions />

        {/* Flagged stories */}
        <AdminFlaggedStories stories={(flaggedStories ?? []).map(s => ({
          ...s,
          qc_score: s.qc_score as Record<string, boolean | string> | null
        }))} />

      </div>
    </main>
  )
}
