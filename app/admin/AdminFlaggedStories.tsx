'use client'
import { useState } from 'react'

type FlaggedStory = {
  id: string
  subscriber_id: string
  story_title: string | null
  qc_score: Record<string, boolean | string> | null
  created_at: string
}

const QC_LABELS: Record<string, string> = {
  protagonist_agency: 'Child drives the story',
  interest_load_bearing: 'Interest matters to plot',
  no_moral_announcement: 'No preachy moments',
  word_count_in_range: 'Right length',
  tone_match: 'Correct mood/tone',
}

function FlaggedStoryCard({ story }: { story: FlaggedStory }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const qc = story.qc_score

  async function approve() {
    setState('loading')
    try {
      const res = await fetch('/api/admin/approve-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setState('done')
        setMessage('Approved — story queued for delivery')
      } else {
        setState('error')
        setMessage(data.error ?? 'Approval failed')
      }
    } catch {
      setState('error')
      setMessage('Request failed')
    }
  }

  async function regenerate() {
    setState('loading')
    try {
      const res = await fetch('/api/admin/regenerate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id, subscriberId: story.subscriber_id }),
      })
      const data = await res.json()
      if (res.ok) {
        setState('done')
        setMessage(`New story generated: "${data.title}"`)
      } else {
        setState('error')
        setMessage(data.error ?? 'Generation failed')
      }
    } catch {
      setState('error')
      setMessage('Request failed')
    }
  }

  if (state === 'done') {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-4">
        <p className="text-green-700 text-sm font-medium">✓ {message}</p>
      </div>
    )
  }

  return (
    <div className="border border-[#e8ddd0] rounded-xl p-4">
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
        <p className="text-xs text-[#5a5550] italic mb-4">{String(qc.failure_notes)}</p>
      )}
      {state === 'error' && (
        <p className="text-xs text-red-600 mb-3">✗ {message}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={regenerate}
          disabled={state === 'loading'}
          className="text-sm px-4 py-2 bg-[#2C2A26] text-white rounded-lg font-medium hover:bg-[#1a1917] disabled:opacity-50 transition-colors"
        >
          {state === 'loading' ? 'Working…' : 'Regenerate'}
        </button>
        <button
          onClick={approve}
          disabled={state === 'loading'}
          className="text-sm px-4 py-2 border border-[#e8ddd0] text-[#5a5550] rounded-lg font-medium hover:bg-[#f5ede2] disabled:opacity-50 transition-colors"
        >
          Approve as-is
        </button>
      </div>
    </div>
  )
}

export function AdminFlaggedStories({ stories }: { stories: FlaggedStory[] }) {
  if (!stories.length) return null

  return (
    <section className="bg-white border border-amber-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-[#2C2A26] mb-2">
        Stories That Failed Quality Check ({stories.length})
      </h2>
      <p className="text-sm text-[#aaa] mb-5">
        These stories didn&apos;t pass quality review after 3 attempts. Regenerate for a fresh attempt, or approve to send as-is.
      </p>
      <div className="space-y-4">
        {stories.map(story => (
          <FlaggedStoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  )
}
