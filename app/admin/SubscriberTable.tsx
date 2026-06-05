'use client'
import { useState } from 'react'

export type SubscriberRow = {
  id: string
  email: string
  status: string
  childName: string
  childAge: number
  storiesDelivered: number
  totalCostUsd: number
  lastStoryDate: string | null
  opensOut: number
  deliveredCount: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Paying', color: 'bg-green-100 text-green-700' },
  free_trial: { label: 'Free Trial', color: 'bg-blue-100 text-blue-700' },
  at_risk: { label: 'Disengaged', color: 'bg-amber-100 text-amber-700' },
  paused: { label: 'Paused', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  re_engagement_paused: { label: 'Paused', color: 'bg-gray-100 text-gray-600' },
}

function SendNowButton({ subscriberId }: { subscriberId: string }) {
  const [state, setState] = useState<'idle' | 'generating' | 'delivering' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function sendNow() {
    setState('generating')
    setMessage('')
    try {
      const genRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId, overrideDeliveryAt: new Date().toISOString() })
      })
      const genData = await genRes.json()
      if (!genRes.ok) {
        setMessage(genData.error ?? 'Generation failed')
        setState('error')
        return
      }

      setState('delivering')
      const delRes = await fetch('/api/deliver-stories')
      if (delRes.ok) {
        setMessage(`"${genData.title}" sent`)
        setState('done')
      } else {
        setMessage('Story generated — will deliver within 5 min')
        setState('done')
      }
    } catch {
      setMessage('Request failed')
      setState('error')
    }
  }

  if (state === 'done') return <span className="text-xs text-green-600 font-medium">✓ {message}</span>
  if (state === 'error') return <span className="text-xs text-red-600 font-medium">✗ {message}</span>

  return (
    <button
      onClick={sendNow}
      disabled={state !== 'idle'}
      className="text-xs px-3 py-1.5 bg-[#E8A838] text-white rounded-lg font-medium hover:bg-[#d4952d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
    >
      {state === 'generating' ? 'Writing…' : state === 'delivering' ? 'Sending…' : 'Send story now'}
    </button>
  )
}

export function SubscriberTable({ rows }: { rows: SubscriberRow[] }) {
  const [sortBy, setSortBy] = useState<'cost' | 'stories' | 'last'>('cost')

  const sorted = [...rows].sort((a, b) => {
    if (sortBy === 'cost') return b.totalCostUsd - a.totalCostUsd
    if (sortBy === 'stories') return b.storiesDelivered - a.storiesDelivered
    if (sortBy === 'last') {
      if (!a.lastStoryDate) return 1
      if (!b.lastStoryDate) return -1
      return new Date(b.lastStoryDate).getTime() - new Date(a.lastStoryDate).getTime()
    }
    return 0
  })

  if (rows.length === 0) {
    return (
      <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-[#2C2A26] mb-2">Subscribers</h2>
        <p className="text-[#aaa] text-sm">No subscribers yet.</p>
      </section>
    )
  }

  return (
    <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#2C2A26]">Subscribers ({rows.length})</h2>
        <div className="flex items-center gap-2 text-xs text-[#aaa]">
          <span>Sort by:</span>
          {(['cost', 'stories', 'last'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-1 rounded ${sortBy === s ? 'bg-[#E8A838] text-white' : 'bg-[#f5ede2] text-[#5a5550]'}`}
            >
              {s === 'cost' ? 'API cost' : s === 'stories' ? 'Stories sent' : 'Last active'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-[#aaa] border-b border-[#e8ddd0]">
              <th className="text-left pb-3 pr-4 font-medium">Child</th>
              <th className="text-left pb-3 pr-4 font-medium">Status</th>
              <th className="text-right pb-3 pr-4 font-medium">Stories sent</th>
              <th className="text-right pb-3 pr-4 font-medium">API cost</th>
              <th className="text-right pb-3 pr-4 font-medium">Opens</th>
              <th className="text-left pb-3 pr-4 font-medium">Last story</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0e8dc]">
            {sorted.map(row => {
              const s = STATUS_LABELS[row.status] ?? { label: row.status, color: 'bg-gray-100 text-gray-600' }
              const openRate = row.deliveredCount > 0
                ? `${row.opensOut}/${row.deliveredCount}`
                : '—'
              const lastDate = row.lastStoryDate
                ? new Date(row.lastStoryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '—'
              const isAtRisk = row.status === 'at_risk'

              return (
                <tr key={row.id} className={isAtRisk ? 'bg-amber-50' : ''}>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-[#2C2A26]">{row.childName}, {row.childAge}</p>
                    <p className="text-xs text-[#aaa] mt-0.5">{row.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-[#2C2A26] font-medium">{row.storiesDelivered}</td>
                  <td className="py-3 pr-4 text-right text-[#2C2A26]">
                    {row.totalCostUsd > 0 ? `$${row.totalCostUsd.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#5a5550]">{openRate}</td>
                  <td className="py-3 pr-4 text-[#5a5550]">{lastDate}</td>
                  <td className="py-3">
                    <SendNowButton subscriberId={row.id} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
