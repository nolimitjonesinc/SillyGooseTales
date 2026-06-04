'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const AGE_RANGES = [
  { label: '2 – 4', value: 3 },
  { label: '5 – 7', value: 6 },
  { label: '8 – 10', value: 9 },
  { label: '11 – 12', value: 11 },
]

const INTERESTS = [
  'Dinosaurs', 'Space', 'Animals', 'Sports', 'Art',
  'Vehicles', 'Ocean', 'Bugs', 'Castles', 'Robots',
  'Fairies', 'Nature', 'Cooking', 'Music', 'Something else...'
]

const TONES = [
  { id: 'cozy_bedtime',    emoji: '🌙', name: 'Cozy Bedtime',    tagline: 'Warm, slow, perfect for drifting off' },
  { id: 'grand_adventure', emoji: '⚡', name: 'Grand Adventure',  tagline: 'Bold, brave, and moving fast' },
  { id: 'giggle_factory',  emoji: '🤣', name: 'Giggle Factory',   tagline: 'Silly, absurd, laugh-out-loud' },
  { id: 'brave_heart',     emoji: '💛', name: 'Brave Heart',      tagline: 'Honest — sits with the hard stuff' },
  { id: 'magic_and_wonder',emoji: '✨', name: 'Magic & Wonder',   tagline: 'Hidden magic in ordinary things' },
  { id: 'laugh_and_learn', emoji: '🔬', name: 'Laugh & Learn',   tagline: 'One real surprising fact in every story' },
]

function SignupForm() {
  const params = useSearchParams()
  const plan = params.get('plan')

  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState<number | null>(null)
  const [interest, setInterest] = useState('')
  const [customInterest, setCustomInterest] = useState('')
  const [toneProfile, setToneProfile] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalInterest = interest === 'Something else...' ? customInterest.trim() : interest

    if (!childName.trim()) return setError('What\'s their name?')
    if (!childAge) return setError('Pick an age range.')
    if (!finalInterest) return setError('What do they love?')
    if (!toneProfile) return setError('Pick a story vibe.')
    if (!email.trim()) return setError('Where should the stories land?')

    setLoading(true)
    setError('')

    try {
      if (plan) {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, plan })
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
        else setError('Something went wrong. Try again.')
      } else {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childName: childName.trim(), childAge, interest: finalInterest, toneProfile, email: email.trim() })
        })
        const data = await res.json()
        if (data.success) setDone(true)
        else setError(data.error ?? 'Something went wrong.')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#FDF6EE] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-5xl mb-6">✨</p>
          <h1 className="text-3xl font-bold text-[#2C2A26] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Tonight&apos;s story is on its way.
          </h1>
          <p className="text-[#5a5550] text-lg leading-relaxed">
            Check your inbox tonight — {childName}&apos;s first story will be there. If you subscribe, a new one lands every night. Each story listens to the last. That&apos;s it. No app, no login, just a great bedtime.
          </p>
          <p className="text-[#aaa] text-sm mt-6">
            Check your spam folder if you don&apos;t see it, or add Silly Goose Tales to your contacts.
          </p>
        </div>
      </main>
    )
  }

  const bubble = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
      active ? 'bg-[#E8A838] text-white' : 'bg-white border border-[#ddd] text-[#5a5550] hover:border-[#E8A838]'
    }`

  return (
    <main className="min-h-screen bg-[#FDF6EE] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2C2A26] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            {plan ? `Start ${plan} plan` : "Let’s write tonight’s story."}
          </h1>
          <p className="text-[#5a5550]">
            {plan ? "Set up your child’s stories in under a minute." : ‘Free story tonight, then one every night after you subscribe. Takes 90 seconds to set up.’}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#5a5550] mb-2">
              What&apos;s their name?
            </label>
            <input
              type="text"
              value={childName}
              onChange={e => setChildName(e.target.value)}
              placeholder="Emma"
              className="w-full text-xl px-4 py-3 border border-[#ddd] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A838] text-[#2C2A26]"
            />
          </div>

          {/* Age range */}
          <div>
            <label className="block text-sm font-medium text-[#5a5550] mb-3">
              How old is {childName || 'your child'}?
            </label>
            <div className="flex gap-3">
              {AGE_RANGES.map(a => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setChildAge(a.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    childAge === a.value
                      ? 'bg-[#E8A838] text-white'
                      : 'bg-white border border-[#ddd] text-[#5a5550] hover:border-[#E8A838]'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-[#5a5550] mb-3">
              What does {childName || 'your child'} love most?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} type="button" onClick={() => setInterest(i)} className={bubble(interest === i)}>
                  {i}
                </button>
              ))}
            </div>
            {interest === 'Something else...' && (
              <input
                type="text"
                value={customInterest}
                onChange={e => setCustomInterest(e.target.value)}
                placeholder="e.g. Minecraft, ballet, sharks…"
                className="mt-3 w-full px-4 py-3 border border-[#ddd] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A838] text-[#2C2A26]"
                autoFocus
              />
            )}
          </div>

          {/* Tone profile */}
          <div>
            <label className="block text-sm font-medium text-[#5a5550] mb-3">
              What kind of stories does {childName || 'your child'} love?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setToneProfile(t.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                    toneProfile === t.id
                      ? 'bg-[#E8A838] border-[#E8A838] text-white'
                      : 'bg-white border-[#ddd] text-[#2C2A26] hover:border-[#E8A838]'
                  }`}
                >
                  <div className="text-xl mb-1">{t.emoji}</div>
                  <div className="text-sm font-semibold leading-tight">{t.name}</div>
                  <div className={`text-xs mt-0.5 leading-tight ${toneProfile === t.id ? 'text-white/80' : 'text-[#aaa]'}`}>
                    {t.tagline}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#5a5550] mb-2">
              Where should the stories land?
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full text-lg px-4 py-3 border border-[#ddd] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A838] text-[#2C2A26]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors disabled:opacity-60"
          >
            {loading ? 'One moment…' : plan ? 'Continue to payment →' : childName ? ('Send ' + childName + "'s story tonight →") : "Send tonight's story →"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF6EE]" />}>
      <SignupForm />
    </Suspense>
  )
}
