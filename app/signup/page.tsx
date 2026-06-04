'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const INTERESTS = [
  'Dinosaurs', 'Space', 'Animals', 'Sports', 'Art',
  'Vehicles', 'Ocean', 'Bugs', 'Castles', 'Robots',
  'Fairies', 'Nature', 'Cooking', 'Music'
]

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get('plan')

  const [childName, setChildName] = useState('')
  const [interest, setInterest] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!childName || !interest || !email) {
      setError('Fill in all three fields to continue.')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (plan) {
        // Paid plan — go to Stripe checkout
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, plan })
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          setError('Something went wrong. Try again.')
        }
      } else {
        // Free trial
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childName, interest, email })
        })
        const data = await res.json()
        if (data.success) {
          setDone(true)
        } else {
          setError(data.error ?? 'Something went wrong.')
        }
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
            Check your inbox tonight
          </h1>
          <p className="text-[#5a5550] text-lg leading-relaxed">
            {childName}&apos;s first story is on its way. It should arrive this evening — ready to read at bedtime.
          </p>
          <p className="text-[#aaa] text-sm mt-6">
            Check your spam folder if you don&apos;t see it — or better yet, add Maya at Silly Goose Tales to your contacts.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDF6EE] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2C2A26] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            {plan ? `Start ${plan} plan` : "Get one story free tonight"}
          </h1>
          <p className="text-[#5a5550]">
            {plan ? "Create your account, then customize your child's stories." : "No credit card. Story arrives in your inbox this evening."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot */}
          <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

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

          <div>
            <label className="block text-sm font-medium text-[#5a5550] mb-3">
              What does {childName || 'your child'} love most?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInterest(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    interest === i
                      ? 'bg-[#E8A838] text-white'
                      : 'bg-white border border-[#ddd] text-[#5a5550] hover:border-[#E8A838]'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

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
            {loading ? 'One moment...' : plan ? 'Continue to payment →' : `Send ${childName || 'the'} first story tonight →`}
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
