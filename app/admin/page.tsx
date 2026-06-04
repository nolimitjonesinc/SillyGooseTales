import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: activeCount },
    { count: atRiskCount },
    { count: totalCount },
    { data: recentLogs },
    { data: flaggedStories },
    { count: queuedCount }
  ] = await Promise.all([
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }).eq('subscription_status', 'at_risk'),
    supabaseAdmin.from('sillytales_subscribers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('sillytales_delivery_log').select('status, email_opened').gte('created_at', sevenDaysAgo),
    supabaseAdmin.from('sillytales_story_queue').select('id, subscriber_id, story_title, qc_score, created_at').eq('status', 'flagged').order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('sillytales_story_queue').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
  ])

  const delivered = recentLogs?.filter(l => l.status === 'delivered').length ?? 0
  const failed = recentLogs?.filter(l => l.status === 'failed' || l.status === 'bounced').length ?? 0
  const opened = recentLogs?.filter(l => l.email_opened).length ?? 0
  const total = recentLogs?.length ?? 0
  const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '—'
  const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '—'

  return (
    <main className="min-h-screen bg-[#FDF6EE] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2C2A26] mb-8" style={{ fontFamily: 'Georgia, serif' }}>
          Silly Goose Tales — Admin
        </h1>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active subscribers', value: activeCount ?? 0 },
            { label: 'At risk (3+ unopened)', value: atRiskCount ?? 0, warn: (atRiskCount ?? 0) > 0 },
            { label: 'Delivery success (7d)', value: `${successRate}%`, warn: parseFloat(successRate) < 98 },
            { label: 'Open rate (7d)', value: `${openRate}%` },
            { label: 'Stories in queue', value: queuedCount ?? 0 },
            { label: 'Flagged for review', value: flaggedStories?.length ?? 0, warn: (flaggedStories?.length ?? 0) > 0 },
            { label: 'Failures this week', value: failed, warn: failed > 0 },
            { label: 'Total subscribers', value: totalCount ?? 0 },
          ].map(s => (
            <div key={s.label}
              className={`bg-white rounded-xl p-4 border-2 ${s.warn ? 'border-amber-300 bg-amber-50' : 'border-[#e8ddd0]'}`}>
              <p className="text-xs text-[#aaa] mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.warn ? 'text-amber-700' : 'text-[#2C2A26]'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Flagged stories */}
        {flaggedStories && flaggedStories.length > 0 && (
          <section className="bg-white border border-amber-200 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-[#2C2A26] mb-4">
              🚩 Flagged Stories ({flaggedStories.length})
            </h2>
            <p className="text-sm text-[#aaa] mb-6">These stories failed QC 3 times. Review and regenerate.</p>
            <div className="space-y-4">
              {flaggedStories.map(story => {
                const qc = story.qc_score as Record<string, boolean | string> | null
                return (
                  <div key={story.id} className="border border-[#e8ddd0] rounded-xl p-4">
                    <p className="font-semibold text-[#2C2A26] mb-1">{story.story_title || 'Untitled'}</p>
                    <p className="text-xs text-[#aaa] mb-3">Subscriber: {story.subscriber_id}</p>
                    {qc && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {['protagonist_agency', 'interest_load_bearing', 'no_moral_announcement', 'word_count_in_range', 'tone_match'].map(k => (
                          <span key={k} className={`text-xs px-2 py-1 rounded-full ${
                            qc[k] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {k.replace(/_/g, ' ')} {qc[k] ? '✓' : '✗'}
                          </span>
                        ))}
                      </div>
                    )}
                    {qc?.failure_notes && (
                      <p className="text-xs text-[#5a5550] italic">{String(qc.failure_notes)}</p>
                    )}
                    <a href={`/admin/review?story=${story.id}`}
                      className="inline-block mt-3 text-sm text-[#E8A838] underline">
                      Review full story →
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#2C2A26] mb-4">Manual Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/admin/review" className="px-4 py-2 bg-[#E8A838] text-white rounded-lg text-sm font-medium hover:bg-[#d4952d]">
              Sampling Review Queue
            </a>
            <a href="/api/health-digest" className="px-4 py-2 bg-[#2C2A26] text-white rounded-lg text-sm font-medium hover:bg-[#1a1917]">
              Run Health Digest Now
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
