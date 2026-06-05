'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const INTERESTS = [
  'Dinosaurs', 'Space', 'Animals', 'Sports', 'Art', 'Vehicles',
  'Ocean', 'Bugs', 'Castles', 'Robots', 'Fairies', 'Nature', 'Cooking', 'Music', 'Something else...'
]
const THEMES_IN = ['Adventure', 'Friendship', 'Family', 'Magic', 'Humor', 'Kindness', 'Courage', 'Curiosity']
const THEMES_OUT = ['Scary content', 'Violence', 'Loss or death', 'Strangers', 'Nightmares', 'Potty humor']
const TONES = [
  { id: 'cozy_bedtime', name: 'Cozy and calm', desc: 'Like a warm blanket in story form' },
  { id: 'grand_adventure', name: 'Big adventure', desc: 'Brave choices, triumphant endings' },
  { id: 'giggle_factory', name: 'Laugh-out-loud', desc: 'Absurd, silly, ends with a punchline' },
  { id: 'brave_heart', name: 'Brave and bold', desc: 'Emotionally honest, no forced cheerfulness' },
  { id: 'magic_and_wonder', name: 'Dreamy and magical', desc: 'Quiet wonder, hidden layers' },
  { id: 'laugh_and_learn', name: 'Laugh & learn', desc: 'Clever curiosity with a dash of silly' },
]
const SLOTS = [
  { id: 'morning', label: 'Morning', sub: '7–8am' },
  { id: 'afternoon', label: 'Afternoon', sub: '3–4pm' },
  { id: 'evening', label: 'Evening', sub: '7–8pm' },
]

function toggle(arr: string[], val: string, max?: number): string[] {
  if (arr.includes(val)) return arr.filter(x => x !== val)
  if (max && arr.length >= max) return arr
  return [...arr, val]
}

export default function OnboardingWizard() {
  const params = useSearchParams()
  const subscriberId = params.get('subscriber_id') ?? ''

  const [step, setStep] = useState(1)
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState<number | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [customInterest, setCustomInterest] = useState('')
  const [themesIn, setThemesIn] = useState<string[]>([])
  const [themesOut, setThemesOut] = useState<string[]>([])
  const [tones, setTones] = useState<string[]>([])
  const [deliverySlot, setDeliverySlot] = useState('evening')
  const [timezone, setTimezone] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [nextDelivery, setNextDelivery] = useState('')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  useEffect(() => {
    if (subscriberId) {
      fetch(`/api/preferences?subscriber_id=${subscriberId}`)
        .then(res => res.json())
        .then(data => {
          if (data.child_name) setChildName(data.child_name)
          if (data.child_age) setChildAge(data.child_age)
          if (data.interests) setInterests(data.interests)
          if (data.themes_include) setThemesIn(data.themes_include)
          if (data.themes_exclude) setThemesOut(data.themes_exclude)
          if (data.tone_profiles && data.tone_profiles.length > 0) {
            setTones(data.tone_profiles)
          } else if (data.tone_profile) {
            setTones([data.tone_profile])
          }
          if (data.delivery_slot) setDeliverySlot(data.delivery_slot)
          if (data.timezone) setTimezone(data.timezone)
        })
        .catch(() => {
          // Silently continue if pre-fill fails
        })
    }
  }, [subscriberId])

  async function handleComplete() {
    setSaving(true)
    try {
      // Replace "Something else..." with custom interest if present
      const finalInterests = interests.map(i =>
        i === 'Something else...' && customInterest ? customInterest : i
      ).filter(i => i !== 'Something else...')

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId,
          childName,
          childAge,
          interests: finalInterests,
          themesInclude: themesIn,
          themesExclude: themesOut,
          toneProfiles: tones,
          deliveryDay: 'daily',
          deliverySlot,
          timezone
        })
      })
      const data = await res.json()
      if (data.success) {
        const d = new Date(data.nextDeliveryAt)
        setNextDelivery(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
        setDone(true)
      }
    } finally {
      setSaving(false)
    }
  }

  const TOTAL_STEPS = 7
  const progress = (step / TOTAL_STEPS) * 100

  if (done) {
    const floaters = ['🪿', '⭐', '📖', '✨', '🌙', '🪄', '🎉', '⭐', '🪿', '✨']
    return (
      <main className="min-h-screen bg-[#FDF6EE] flex items-center justify-center px-6 overflow-hidden relative">
        {floaters.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl pointer-events-none select-none"
            style={{ left: '50%', top: '50%' }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.3, 1, 0.6],
              x: Math.round(Math.cos((i * 36) * Math.PI / 180) * (120 + (i % 3) * 60)),
              y: Math.round(Math.sin((i * 36) * Math.PI / 180) * (100 + (i % 3) * 50)),
            }}
            transition={{ delay: 0.1 + i * 0.08, duration: 1.8, ease: 'easeOut' }}
          >
            {emoji}
          </motion.div>
        ))}

        <div className="max-w-md text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            className="text-8xl mb-6 inline-block"
          >
            🪿
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-4xl font-bold text-[#2C2A26] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {childName}&apos;s story universe is live.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-[#5a5550] text-xl leading-relaxed mb-3"
          >
            One fresh story, every single day.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-[#aaa] text-sm leading-relaxed"
          >
            The first one is being written right now — check your inbox in a few minutes.
          </motion.p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDF6EE]">
      <div className="h-1 bg-[#e8ddd0] fixed top-0 left-0 right-0 z-10">
        <div className="h-full bg-[#E8A838] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-lg mx-auto px-6 pt-16 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="text-center pt-16">
                <h1 className="text-4xl font-bold text-[#2C2A26] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  A story. Every day. Just for them.
                </h1>
                <p className="text-[#5a5550] text-lg mb-12">Let&apos;s set it up — takes about 2 minutes.</p>
                <button onClick={() => setStep(2)}
                  className="bg-[#E8A838] text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                  Let&apos;s set it up →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="pt-8">
                <label className="block text-2xl font-semibold text-[#2C2A26] mb-6">
                  {childAge ? `Perfect. How old is ${childName}?` : "What's their name?"}
                </label>
                {!childAge && (
                  <input autoFocus type="text" value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="Emma"
                    className="w-full text-2xl px-5 py-4 border border-[#ddd] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A838] text-[#2C2A26] mb-6"
                  />
                )}
                {childName && (
                  <>
                    <div className="flex gap-3 flex-wrap mb-8">
                      {Array.from({ length: 9 }, (_, i) => i + 2).map(age => (
                        <button key={age} onClick={() => setChildAge(age)}
                          className={`w-14 h-14 rounded-full text-lg font-semibold transition-colors ${
                            childAge === age
                              ? 'bg-[#E8A838] text-white'
                              : 'bg-white border-2 border-[#ddd] text-[#2C2A26] hover:border-[#E8A838]'
                          }`}>{age}</button>
                      ))}
                    </div>
                    {childAge && (
                      <button onClick={() => setStep(3)}
                        className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                        Next →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="pt-8">
                <h2 className="text-2xl font-semibold text-[#2C2A26] mb-2">
                  Pick what {childName} lights up about.
                </h2>
                <p className="text-[#aaa] text-sm mb-6">Pick a few — up to 6</p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => setInterests(toggle(interests, i, 6))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        interests.includes(i)
                          ? 'bg-[#F2C4A0] text-[#2C2A26] border-2 border-[#E8A838]'
                          : 'bg-white border-2 border-[#ddd] text-[#5a5550] hover:border-[#E8A838]'
                      }`}>{i}</button>
                  ))}
                </div>
                {interests.includes('Something else...') && (
                  <input
                    autoFocus
                    type="text"
                    value={customInterest}
                    onChange={e => setCustomInterest(e.target.value)}
                    placeholder="e.g. Minecraft, ballet, sharks…"
                    className="w-full text-lg px-5 py-3 border border-[#ddd] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A838] text-[#2C2A26] mb-8"
                  />
                )}
                {interests.filter(i => i !== 'Something else...' || customInterest).length > 0 && (
                  <button onClick={() => setStep(4)}
                    className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                    Next →
                  </button>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="pt-8">
                <h2 className="text-2xl font-semibold text-[#2C2A26] mb-8">Story ingredients</h2>
                <div className="mb-8">
                  <p className="text-sm font-medium text-[#5a5550] uppercase tracking-wide mb-3">Always stir in...</p>
                  <div className="flex flex-wrap gap-3">
                    {THEMES_IN.map(t => (
                      <button key={t} onClick={() => setThemesIn(toggle(themesIn, t))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          themesIn.includes(t)
                            ? 'bg-[#F2C4A0] text-[#2C2A26] border-2 border-[#E8A838]'
                            : 'bg-white border-2 border-[#ddd] text-[#5a5550] hover:border-[#E8A838]'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-sm font-medium text-[#5a5550] uppercase tracking-wide mb-3">Leave these out entirely</p>
                  <div className="flex flex-wrap gap-3">
                    {THEMES_OUT.map(t => (
                      <button key={t} onClick={() => setThemesOut(toggle(themesOut, t))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          themesOut.includes(t)
                            ? 'bg-[#fee2e2] text-red-700 border-2 border-red-300'
                            : 'bg-white border-2 border-[#ddd] text-[#5a5550] hover:border-red-300'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(5)}
                  className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                  Next →
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="pt-8">
                <h2 className="text-2xl font-semibold text-[#2C2A26] mb-2">
                  What vibe feels right for {childName}?
                </h2>
                <p className="text-[#aaa] text-sm mb-6">Pick at least one</p>
                <div className="space-y-3 mb-8">
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => setTones(toggle(tones, t.id))}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative ${
                        tones.includes(t.id)
                          ? 'border-[#E8A838] bg-[#FFF8EE] scale-[1.01]'
                          : 'border-[#ddd] bg-white hover:border-[#E8A838] opacity-80'
                      }`}>
                      <p className="font-semibold text-[#2C2A26] text-lg">{t.name}</p>
                      <p className="text-[#5a5550] text-sm mt-1">{t.desc}</p>
                      {tones.includes(t.id) && (
                        <span className="absolute top-4 right-4 text-[#E8A838] text-xl">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                {tones.length > 0 && (
                  <button onClick={() => setStep(6)}
                    className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                    Next →
                  </button>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="pt-8">
                <h2 className="text-2xl font-semibold text-[#2C2A26] mb-2">
                  What time should {childName}&apos;s story arrive?
                </h2>
                <p className="text-[#aaa] text-sm mb-6">A new story lands every day.</p>
                <div className="flex gap-3 mb-8">
                  {SLOTS.map(s => (
                    <button key={s.id} onClick={() => setDeliverySlot(s.id)}
                      className={`flex-1 py-4 rounded-xl text-center transition-colors border-2 ${
                        deliverySlot === s.id
                          ? 'border-[#E8A838] bg-[#FFF8EE]'
                          : 'border-[#ddd] bg-white hover:border-[#E8A838]'
                      }`}>
                      <p className="font-semibold text-[#2C2A26]">{s.label}</p>
                      <p className="text-xs text-[#aaa]">{s.sub}</p>
                    </button>
                  ))}
                </div>
                <div className="mb-8">
                  <p className="text-sm font-medium text-[#5a5550] mb-2">Your timezone</p>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-[#ddd] rounded-xl bg-white text-[#2C2A26] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  >
                    <option value="America/New_York">Eastern — New York, Miami, Atlanta</option>
                    <option value="America/Chicago">Central — Chicago, Dallas, Houston</option>
                    <option value="America/Denver">Mountain — Denver, Salt Lake City</option>
                    <option value="America/Phoenix">Arizona — Phoenix (no daylight saving)</option>
                    <option value="America/Los_Angeles">Pacific — Los Angeles, Seattle</option>
                    <option value="America/Anchorage">Alaska</option>
                    <option value="Pacific/Honolulu">Hawaii</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris / Berlin / Amsterdam</option>
                    <option value="Australia/Sydney">Sydney / Melbourne</option>
                    <option value="Australia/Perth">Perth</option>
                    <option value="America/Toronto">Toronto / Ottawa</option>
                  </select>
                </div>
                <button onClick={() => setStep(7)}
                  className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                  Start the stories →
                </button>
              </div>
            )}

            {step === 7 && (
              <div className="pt-8">
                <h2 className="text-2xl font-semibold text-[#2C2A26] mb-3">One last step</h2>
                <p className="text-[#5a5550] text-lg mb-8 leading-relaxed">
                  Add Silly Goose Tales to your contacts so the story always finds its way to bedtime.
                </p>
                <div className="bg-white border border-[#e8ddd0] rounded-2xl p-6 mb-8 space-y-6">
                  <div>
                    <p className="font-semibold text-[#2C2A26] mb-2">📱 iPhone (Apple Mail)</p>
                    <ol className="text-[#5a5550] text-sm space-y-1 list-decimal list-inside">
                      <li>Open the confirmation email from Maya at Silly Goose Tales</li>
                      <li>Tap the sender name</li>
                      <li>Tap &quot;Create New Contact&quot;</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2A26] mb-2">📬 Gmail</p>
                    <ol className="text-[#5a5550] text-sm space-y-1 list-decimal list-inside">
                      <li>Open any email from Silly Goose Tales</li>
                      <li>Hover the sender name</li>
                      <li>Click &quot;Add to contacts&quot;</li>
                    </ol>
                  </div>
                </div>
                <button onClick={handleComplete} disabled={saving}
                  className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors disabled:opacity-60">
                  {saving ? 'Setting up...' : "Done — I added it ✓"}
                </button>
                <button onClick={handleComplete} disabled={saving}
                  className="w-full text-center text-sm text-[#aaa] mt-3 hover:text-[#5a5550]">
                  Skip for now
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step > 1 && step < 7 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-8 text-sm text-[#aaa] hover:text-[#5a5550]">
            ← Back
          </button>
        )}
      </div>
    </main>
  )
}
