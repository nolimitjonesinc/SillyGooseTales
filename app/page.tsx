'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const TAGLINES = [
  "You've kept them alive all day. Let us handle the story.",
  "They'll think you wrote it. You'll think you're a genius. We won't tell.",
  "Because \"once upon a time, mommy needs wine\" is not a bedtime story.",
  "Stop making stuff up in the dark. We made a better one.",
  "They want a story. You want sleep. Done.",
]

export default function LandingPage() {
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

  return (
    <main className="min-h-screen bg-[#FDF6EE]">

      {/* Hero */}
      <section className="max-w-xl mx-auto px-6 pt-20 pb-10 text-center">
        <p className="text-[#E8A838] text-xs font-semibold tracking-[0.2em] uppercase mb-8">
          Silly Goose Tales
        </p>
        <h1
          className="text-5xl font-bold text-[#2C2A26] leading-tight mb-5"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          A new story every week.<br />Written just for them.
        </h1>
        <p
          className="text-lg text-[#5a5550] mb-8 leading-relaxed transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {TAGLINES[taglineIndex]}
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#E8A838] text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          Get your child&apos;s first story free tonight
        </Link>
        <p className="text-sm text-[#bbb] mt-3">No credit card. No app. Story arrives tonight.</p>
      </section>

      {/* Sample story — shows exactly what lands in inbox */}
      <section className="max-w-xl mx-auto px-6 pb-14">
        <div className="bg-white rounded-2xl border border-[#e8ddd0] px-8 py-8 shadow-sm">
          <p
            className="text-[#bbb] text-xs tracking-widest uppercase mb-4"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            A story for Emma, Wednesday evening
          </p>
          <p
            className="text-2xl font-bold text-[#E8A838] mb-5"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The Firefly Theory
          </p>
          <p
            className="text-lg text-[#2C2A26] leading-relaxed mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Emma had a theory about fireflies — that if you followed one long enough, it would lead
            you somewhere wonderful. She&apos;d never tested it. But tonight, just before bed, she
            put on her shoes and slipped into the dark garden to find out.
          </p>

          {/* Mood row — shows the mechanic in context */}
          <div className="border-t border-[#f0e8de] pt-5">
            <p
              className="text-xs text-[#bbb] text-center mb-3"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              How is Emma feeling tonight?
            </p>
            <div className="flex justify-center gap-5 text-2xl">
              <span>😄</span>
              <span>😴</span>
              <span>🤪</span>
              <span>🤩</span>
              <span>🤗</span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[#aaa] mt-4">
          Tap a mood — the next story adapts to how they&apos;re feeling.
        </p>
      </section>

      {/* Pricing */}
      <section className="max-w-xl mx-auto px-6 py-12 border-t border-[#e8ddd0]">
        <h2
          className="text-2xl font-bold text-[#2C2A26] text-center mb-8"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Simple pricing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-7 text-center">
            <p className="text-[#5a5550] text-sm mb-2">Monthly</p>
            <p className="text-4xl font-bold text-[#2C2A26] mb-1">$9.99</p>
            <p className="text-[#bbb] text-sm mb-5">per month</p>
            <Link
              href="/signup?plan=monthly"
              className="block w-full bg-[#2C2A26] text-white py-3 rounded-xl hover:bg-[#1a1917] transition-colors font-medium"
            >
              Start monthly
            </Link>
          </div>
          <div className="bg-[#2C2A26] rounded-2xl p-7 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-[#E8A838] text-white text-xs font-bold px-3 py-1 rounded-full">
              SAVE 25%
            </div>
            <p className="text-[#888] text-sm mb-2">Annual</p>
            <p className="text-4xl font-bold text-white mb-1">$89.99</p>
            <p className="text-[#666] text-sm mb-5">$7.50/month · billed once</p>
            <Link
              href="/signup?plan=annual"
              className="block w-full bg-[#E8A838] text-white py-3 rounded-xl hover:bg-[#d4952d] transition-colors font-medium"
            >
              Start annual
            </Link>
          </div>
        </div>
        <p className="text-center text-[#aaa] text-sm mt-5">
          Try free first — no credit card.{' '}
          <Link href="/signup" className="underline text-[#5a5550]">
            Get one story tonight →
          </Link>
        </p>
      </section>

      <footer className="border-t border-[#e8ddd0] py-8 text-center">
        <p className="text-[#ccc] text-sm">Silly Goose Tales · Stories that know your kid</p>
      </footer>

    </main>
  )
}
