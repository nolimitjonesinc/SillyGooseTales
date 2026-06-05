import { supabaseAdmin } from '@/lib/supabase'
import { AdminActions } from './AdminActions'
import { SubscriberTable } from './SubscriberTable'
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

        {/* Pipeline */}
        {queuedStories && queuedStories.length > 0 && (
          <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-4">
              Stories Waiting to Send ({queuedStories.length})
            </h2>
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
          </section>
        )}

        {/* Quick actions */}
        <AdminActions />

        {/* Flagged stories */}
        {flaggedStories && flaggedStories.length > 0 && (
          <section className="bg-white border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#2C2A26] mb-2">
              Stories That Failed Quality Check ({flaggedStories.length})
            </h2>
            <p className="text-sm text-[#aaa] mb-5">
              These stories didn&apos;t pass quality review after 3 attempts. Review them and decide whether to regenerate or approve.
            </p>
            <div className="space-y-4">
              {flaggedStories.map(story => {
                const qc = story.qc_score as Record<string, boolean | string> | null
                const QC_LABELS: Record<string, string> = {
                  protagonist_agency: 'Child drives the story',
                  interest_load_bearing: 'Interest matters to plot',
                  no_moral_announcement: 'No preachy moments',
                  word_count_in_range: 'Right length',
                  tone_match: 'Correct mood/tone'
                }
                return (
                  <div key={story.id} className="border border-[#e8ddd0] rounded-xl p-4">
                    <p className="font-semibold text-[#2C2A26] mb-3">{story.story_title || 'Untitled'}</p>
                    {qc && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(QC_LABELS).map(([k, label]) => (
                          <span key={k} className={`text-xs px-2 py-1 rounded-full ${
                            qc[k] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {label} {qc[k] ? '✓' : '✗'}
                          </span>
                        ))}
                      </div>
                    )}
                    {qc?.failure_notes && (
                      <p className="text-xs text-[#5a5550] italic mb-3">{String(qc.failure_notes)}</p>
                    )}
                    <a href={`/admin/review?story=${story.id}`}
                      className="text-sm text-[#E8A838] underline">
                      Review full story →
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
