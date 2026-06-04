'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const TAGLINES = [
  "You've kept them alive all day. Let us handle the story.",
  "They'll think you wrote it. You'll think you're a genius. We won't tell.",
  "Because \"once upon a time, mommy needs wine\" is not a bedtime story.",
  "Stop making stuff up in the dark. We made a better one.",
  "They want a story. You want sleep. Done.",
]

export default function LandingPage() {
  const [name, setName] = useState('')
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length)
        setVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const firstName = name.trim().split(' ')[0]
  const signupHref = firstName
    ? `/signup?name=${encodeURIComponent(firstName)}`
    : '/signup'

  return (
    <main className="min-h-screen bg-[#FDF6EE]">

      {/* Hero */}
      <section className="max-w-lg mx-auto px-6 pt-12 pb-10 text-center">

        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Silly Goose Tales"
            width={110}
            height={110}
            className="rounded-2xl"
            priority
          />
        </div>
        <p className="text-[#E8A838] text-sm font-semibold tracking-[0.2em] uppercase mb-6">
          Silly Goose Tales
        </p>

        <h1
          className="text-4xl font-bold text-[#2C2A26] leading-tight mb-4"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Bedtime stories for your silly goose. Every night.
        </h1>

        <p className="text-base text-[#5a5550] mb-6 leading-relaxed">
          No app. No login. Just a story waddling into your inbox.
        </p>

        {/* Name input */}
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What's their name?"
            className="w-full text-lg px-5 py-4 border-2 border-[#e8ddd0] rounded-xl bg-white focus:outline-none focus:border-[#E8A838] text-[#2C2A26] text-center transition-colors"
          />
        </div>

        {/* CTA */}
        <Link
          href={signupHref}
          className="inline-block w-full bg-[#E8A838] text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          {firstName
            ? `Send ${firstName}'s first story tonight →`
            : 'Get your first story free tonight'
          }
        </Link>
        <p className="text-xs text-[#bbb] mt-3">Free tonight. No credit card. 90 seconds to set up.</p>

        {/* Rotating tagline */}
        <p
          className="text-sm text-[#5a5550] italic mt-6 transition-opacity duration-400 min-h-[1.5rem] bg-[#EDE4D8] px-4 py-2 rounded-full inline-block"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {TAGLINES[taglineIndex]}
        </p>
      </section>

      {/* Story preview */}
      <section className="max-w-lg mx-auto px-6 pb-10">
        <div className="bg-white rounded-2xl border border-[#e8ddd0] px-7 py-7 shadow-sm">
          <p className="text-[#bbb] text-xs tracking-widest uppercase mb-3">
            A story for {firstName || 'Emma'}, Wednesday evening
          </p>
          <p
            className="text-xl font-bold text-[#E8A838] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The Firefly Theory
          </p>
          <p
            className="text-base text-[#2C2A26] leading-relaxed mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {firstName || 'Emma'} had a theory about fireflies — that if you followed one long enough,
            it would lead you somewhere wonderful. They&apos;d never tested it. But tonight, just before
            bed, they put on their shoes and slipped into the dark garden to find out.
          </p>
          <div className="border-t border-[#f0e8de] pt-5">
            <p className="text-xs text-[#bbb] text-center mb-3">
              How is {firstName || 'Emma'} feeling tonight?
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['Happy', 'Sleepy', 'Silly', 'Excited', 'Cozy'].map(mood => (
                <span
                  key={mood}
                  className="px-3 py-1 rounded-full border border-[#e8ddd0] text-xs text-[#5a5550] bg-[#fdf6ee]"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-[#aaa] mt-3">
          Tap a mood after every story — the next one adapts.
        </p>
      </section>

      {/* Pricing */}
      <section className="max-w-lg mx-auto px-6 pb-12">
        <h2
          className="text-lg font-bold text-[#2C2A26] text-center mb-1"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Simple pricing
        </h2>
        <p className="text-center text-[#5a5550] text-xs mb-6">One new story every night, delivered to your inbox.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-6 text-center">
            <p className="text-[#5a5550] text-xs mb-1">Monthly</p>
            <p className="text-3xl font-bold text-[#2C2A26] mb-1">$9.99</p>
            <p className="text-[#bbb] text-xs mb-5">per month</p>
            <Link
              href={firstName ? `/signup?plan=monthly&name=${encodeURIComponent(firstName)}` : '/signup?plan=monthly'}
              className="block w-full bg-[#2C2A26] text-white py-2.5 rounded-xl hover:bg-[#1a1917] transition-colors font-medium text-sm"
            >
              Start monthly
            </Link>
          </div>
          <div className="bg-[#2C2A26] rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-[#E8A838] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              25% OFF
            </div>
            <p className="text-[#888] text-xs mb-1">Annual</p>
            <p className="text-3xl font-bold text-white mb-1">$89.99</p>
            <p className="text-[#666] text-xs mb-5">$7.50/mo</p>
            <Link
              href={firstName ? `/signup?plan=annual&name=${encodeURIComponent(firstName)}` : '/signup?plan=annual'}
              className="block w-full bg-[#E8A838] text-white py-2.5 rounded-xl hover:bg-[#d4952d] transition-colors font-medium text-sm"
            >
              Start annual
            </Link>
          </div>
        </div>
        <p className="text-center text-[#aaa] text-xs mt-4">
          Free tonight, no credit card.{' '}
          <Link href={signupHref} className="underline text-[#5a5550]">
            Try it first →
          </Link>
        </p>
      </section>

      <footer className="border-t border-[#e8ddd0] py-6 text-center">
        <p className="text-[#ccc] text-xs">Silly Goose Tales · No app. No login. Just stories.</p>
      </footer>

    </main>
  )
}
