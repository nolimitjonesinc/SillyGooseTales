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
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-10 text-center">
        <p className="text-[#E8A838] text-xs font-semibold tracking-[0.2em] uppercase mb-8">
          Silly Goose Tales
        </p>
        <h1
          className="text-5xl font-bold text-[#2C2A26] leading-tight mb-5"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Personalized bedtime stories.<br />Emailed tonight.
        </h1>
        <p className="text-xl text-[#5a5550] mb-10 leading-relaxed">
          No app. No login. Just a story your kid actually wants to hear.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#E8A838] text-white text-lg font-semibold px-10 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          Get your first story free tonight
        </Link>
        <p className="text-sm text-[#bbb] mt-4">Takes 2 minutes. Arrives tonight. No credit card.</p>
      </section>

      {/* Rotating tagline */}
      <section className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <p
          className="text-base text-[#9a8f85] italic transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {TAGLINES[taglineIndex]}
        </p>
      </section>

      {/* Sample story — the star */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-[#e8ddd0] px-10 py-10 shadow-md">
          <p
            className="text-[#bbb] text-xs tracking-widest uppercase mb-5"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            A story for Emma, Wednesday evening
          </p>
          <p
            className="text-3xl font-bold text-[#E8A838] mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The Firefly Theory
          </p>
          <p
            className="text-xl text-[#2C2A26] leading-relaxed mb-8"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Emma had a theory about fireflies — that if you followed one long enough, it would lead
            you somewhere wonderful. She&apos;d never tested it. But tonight, just before bed, she
            put on her shoes and slipped into the dark garden to find out.
          </p>
          <div className="border-t border-[#f0e8de] pt-6">
            <p
              className="text-xs text-[#bbb] text-center mb-4"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              How is Emma feeling tonight?
            </p>
            <div className="flex justify-center gap-6 text-3xl">
              <span>😄</span><span>😴</span><span>🤪</span><span>🤩</span><span>🤗</span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[#aaa] mt-5">
          Tap a mood after every story. The next one picks up from there.
        </p>
      </section>

      {/* How it works — 3 steps */}
      <section className="max-w-2xl mx-auto px-6 py-14 border-t border-[#e8ddd0]">
        <h2
          className="text-2xl font-bold text-[#2C2A26] text-center mb-12"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div>
            <p className="text-3xl mb-4">✍️</p>
            <p className="font-semibold text-[#2C2A26] mb-2">Tell us about your kid</p>
            <p className="text-[#5a5550] text-sm leading-relaxed">Name, age, what they love, and the vibe you want at bedtime. Two minutes.</p>
          </div>
          <div>
            <p className="text-3xl mb-4">📬</p>
            <p className="font-semibold text-[#2C2A26] mb-2">Stories land in your inbox</p>
            <p className="text-[#5a5550] text-sm leading-relaxed">One story every week on the day you choose. Their interests aren&apos;t decoration — they drive the whole plot.</p>
          </div>
          <div>
            <p className="text-3xl mb-4">😄</p>
            <p className="font-semibold text-[#2C2A26] mb-2">Tap a mood. Next story adapts.</p>
            <p className="text-[#5a5550] text-sm leading-relaxed">After every story, five emojis. One tap. Next week starts from where your kid actually is.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-2xl mx-auto px-6 py-14 border-t border-[#e8ddd0]">
        <div className="space-y-12">
          <blockquote className="text-center">
            <p
              className="text-2xl text-[#2C2A26] leading-snug mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              &ldquo;My son asked me how I knew the dinosaur&apos;s name. I told him I had a secret writer friend. He believed me for three weeks.&rdquo;
            </p>
            <cite className="text-[#bbb] text-sm not-italic">— Sarah M., mom of a 6-year-old T-rex obsessive</cite>
          </blockquote>
          <blockquote className="text-center">
            <p
              className="text-2xl text-[#2C2A26] leading-snug mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              &ldquo;I was spending 20 minutes every night improvising stories I&apos;d mostly forget by morning. Now I just open my email.&rdquo;
            </p>
            <cite className="text-[#bbb] text-sm not-italic">— Marcus T., dad of two, ages 5 and 8</cite>
          </blockquote>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-2xl mx-auto px-6 py-14 border-t border-[#e8ddd0]">
        <h2
          className="text-2xl font-bold text-[#2C2A26] text-center mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Simple pricing
        </h2>
        <p className="text-center text-[#5a5550] text-sm mb-10">One story every week, on the day you choose.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md mx-auto">
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-7 text-center">
            <p className="text-[#5a5550] text-sm mb-2">Monthly</p>
            <p className="text-4xl font-bold text-[#2C2A26] mb-1">$9.99</p>
            <p className="text-[#bbb] text-sm mb-6">per month</p>
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
            <p className="text-[#666] text-sm mb-6">$7.50/month · billed once</p>
            <Link
              href="/signup?plan=annual"
              className="block w-full bg-[#E8A838] text-white py-3 rounded-xl hover:bg-[#d4952d] transition-colors font-medium"
            >
              Start annual
            </Link>
          </div>
        </div>
        <p className="text-center text-[#aaa] text-sm mt-6">
          Try free first — no credit card.{' '}
          <Link href="/signup" className="underline text-[#5a5550]">
            Get one story tonight →
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p
          className="text-4xl font-bold text-[#2C2A26] mb-5 leading-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Tonight&apos;s story is already written.<br />It just needs a name.
        </p>
        <p className="text-[#5a5550] text-lg mb-10">
          Two minutes to set up. Free tonight. One every week after that.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#E8A838] text-white text-lg font-semibold px-10 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          Get your first story free
        </Link>
      </section>

      <footer className="border-t border-[#e8ddd0] py-8 text-center">
        <p className="text-[#ccc] text-sm">Silly Goose Tales · No app. No login. Just stories.</p>
      </footer>

    </main>
  )
}
