'use client'
import { useState } from 'react'

type ActionResult = { message: string; ok: boolean } | null

function ActionButton({ label, endpoint, method = 'GET' }: { label: string; endpoint: string; method?: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ActionResult>(null)

  async function run() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(endpoint, { method })
      const data = await res.json()
      if (res.ok) {
        const parts = []
        if (data.delivered != null) parts.push(`${data.delivered} delivered`)
        if (data.processed != null) parts.push(`${data.processed} queued`)
        if (data.failed != null && data.failed > 0) parts.push(`${data.failed} failed`)
        setResult({ ok: true, message: parts.length ? parts.join(', ') : 'Done' })
      } else {
        setResult({ ok: false, message: data.error ?? 'Something went wrong' })
      }
    } catch {
      setResult({ ok: false, message: 'Request failed — check network' })
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={loading}
        className="px-4 py-2 bg-[#2C2A26] text-white rounded-lg text-sm font-medium hover:bg-[#1a1917] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Running…' : label}
      </button>
      {result && (
        <span className={`text-sm font-medium ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
          {result.ok ? '✓' : '✗'} {result.message}
        </span>
      )}
    </div>
  )
}

export function AdminActions() {
  return (
    <section className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
      <h2 className="text-lg font-bold text-[#2C2A26] mb-5">Quick Actions</h2>
      <div className="space-y-3">
        <ActionButton label="Deliver all due stories now" endpoint="/api/deliver-stories" />
        <ActionButton label="Queue stories for next 24h" endpoint="/api/queue-stories" />
        <ActionButton label="Send weekly health digest" endpoint="/api/health-digest" />
      </div>
    </section>
  )
}
