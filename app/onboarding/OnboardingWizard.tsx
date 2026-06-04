'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const INTERESTS = [
  'Dinosaurs', 'Space', 'Animals', 'Sports', 'Art', 'Vehicles',
  'Ocean', 'Bugs', 'Castles', 'Robots', 'Fairies', 'Nature', 'Cooking', 'Music'
]
const THEMES_IN = ['Adventure', 'Friendship', 'Family', 'Magic', 'Humor', 'Kindness', 'Courage', 'Curiosity']
const THEMES_OUT = ['Scary content', 'Violence', 'Loss or death', 'Strangers', 'Nightmares', 'Potty humor']
const TONES = [
  { id: 'cozy_bedtime', name: 'Cozy and calm', desc: 'Like a warm blanket in story form' },
  { id: 'grand_adventure', name: 'Big adventure', desc: 'Brave choices, triumphant endings' },
  { id: 'giggle_factory', name: 'Laugh-out-loud', desc: 'Absurd, silly, ends with a punchline' },
  { id: 'brave_heart', name: 'Brave and bold', desc: 'Emotionally honest, no forced cheerfulness' },
  { id: 'magic_and_wonder', name: 'Dreamy and magical', desc: 'Quiet wonder, hidden layers' },
]
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
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
  const [themesIn, setThemesIn] = useState<string[]>([])
  const [themesOut, setThemesOut] = useState<string[]>([])
  const [tone, setTone] = useState('')
  const [deliveryDay, setDeliveryDay] = useState('Friday')
  const [deliverySlot, setDeliverySlot] = useState('evening')
  const [timezone, setTimezone] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [nextDelivery, setNextDelivery] = useState('')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  async function handleComplete() {
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId,
          childName,
          childAge,
          interests,
          themesInclude: themesIn,
          themesExclude: themesOut,
          toneProfile: tone,
          deliveryDay: deliveryDay.toLowerCase(),
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
    return (
      <main className="min-h-screen bg-[#FDF6EE] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-5xl mb-6">🌟</p>
          <h1 className="text-3xl font-bold text-[#2C2A26] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            All set!
          </h1>
          <p className="text-[#5a5550] text-lg leading-relaxed">
            {childName}&apos;s first story arrives {nextDelivery ? `on ${nextDelivery}` : 'soon'}.
            We&apos;ll send a sample story shortly.
          </p>
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
                  A story. Every week. Just for them.
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
                      {Array.from({ length: 8 }, (_, i) => i + 3).map(age => (
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
                {interests.length > 0 && (
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
                <p className="text-[#aaa] text-sm mb-6">Pick one</p>
                <div className="space-y-3 mb-8">
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => setTone(t.id)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                        tone === t.id
                          ? 'border-[#E8A838] bg-[#FFF8EE] scale-[1.01]'
                          : 'border-[#ddd] bg-white hover:border-[#E8A838] opacity-80'
                      }`}>
                      <p className="font-semibold text-[#2C2A26] text-lg">{t.name}</p>
                      <p className="text-[#5a5550] text-sm mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
                {tone && (
                  <button onClick={() => setStep(6)}
                    className="w-full bg-[#E8A838] text-white text-lg font-semibold py-4 rounded-xl hover:bg-[#d4952d] transition-colors">
                    Next →
                  </button>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="pt-8">
                <h2 className="text-2xl font-semibold text-[#2C2A26] mb-8">
                  When should {childName}&apos;s story arrive?
                </h2>
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#5a5550] mb-3">Day</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(d => (
                      <button key={d} onClick={() => setDeliveryDay(d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          deliveryDay === d
                            ? 'bg-[#E8A838] text-white'
                            : 'bg-white border-2 border-[#ddd] text-[#5a5550] hover:border-[#E8A838]'
                        }`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#5a5550] mb-3">Time</p>
                  <div className="flex gap-3">
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
                </div>
                {timezone && (
                  <p className="text-sm text-[#aaa] mb-6">
                    Timezone: {timezone.replace(/_/g, ' ')}{' '}
                    <button className="underline text-[#5a5550]" onClick={() => {
                      const tz = prompt('Enter your timezone (e.g. America/Chicago):', timezone)
                      if (tz) setTimezone(tz)
                    }}>Change it</button>
                  </p>
                )}
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
