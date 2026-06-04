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
          Tonight&apos;s story is already written.<br />It just needs a name.
        </h1>
        <p className="text-lg text-[#5a5550] mb-3 leading-relaxed">
          One new story every week, built around what your kid actually loves — delivered to your inbox. No app. No login. Just read.
        </p>
        <p className="text-base text-[#5a5550] mb-8 leading-relaxed">
          Your first story arrives tonight, free. After that, one lands every week on the day you choose. Each one is written around your child&apos;s actual interests — not just their name dropped in, but dinosaurs solving the mystery, space exploration gone sideways, whatever they&apos;re obsessed with right now.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#E8A838] text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          Get your child&apos;s first story free tonight
        </Link>
        <p className="text-sm text-[#bbb] mt-3">
          Tonight is free. No credit card. After that, one story every week on the day you pick — cancel any time.
        </p>
      </section>

      {/* Rotating tagline */}
      <section className="max-w-xl mx-auto px-6 pb-8 text-center">
        <p
          className="text-base text-[#5a5550] italic transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {TAGLINES[taglineIndex]}
        </p>
      </section>

      {/* Sample story card */}
      <section className="max-w-xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-2xl border border-[#e8ddd0] px-8 py-8 shadow-sm">
          <p className="text-[#bbb] text-xs tracking-widest uppercase mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>A story for Emma, Wednesday evening</p>
          <p className="text-2xl font-bold text-[#E8A838] mb-5" style={{ fontFamily: 'Georgia, serif' }}>The Firefly Theory</p>
          <p className="text-lg text-[#2C2A26] leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Emma had a theory about fireflies — that if you followed one long enough, it would lead you somewhere wonderful. She&apos;d never tested it. But tonight, just before bed, she put on her shoes and slipped into the dark garden to find out.
          </p>
          <div className="border-t border-[#f0e8de] pt-5">
            <p className="text-xs text-[#bbb] text-center mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>How is Emma feeling tonight?</p>
            <div className="flex justify-center gap-5 text-2xl"><span>😄</span><span>😴</span><span>🤪</span><span>🤩</span><span>🤗</span></div>
          </div>
        </div>
        <p className="text-center text-sm text-[#aaa] mt-4">
          How are they feeling tonight? Tap an emoji after every story. Next week&apos;s story starts there.
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-xl mx-auto px-6 py-12 border-t border-[#e8ddd0]">
        <h2
          className="text-2xl font-bold text-[#2C2A26] text-center mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Here&apos;s the thing about bedtime.
        </h2>
        <p className="text-center text-[#5a5550] text-base mb-10">
          You&apos;re exhausted. They&apos;re wired. You need a story that actually lands. We handle that part.
        </p>
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <span className="text-2xl mt-0.5">✍️</span>
            <div>
              <p className="font-semibold text-[#2C2A26] mb-1">Tell us about your kid</p>
              <p className="text-[#5a5550] text-sm leading-relaxed">Name, age, what they&apos;re obsessed with, and the vibe you want at bedtime — cozy, adventurous, silly, brave. Takes two minutes.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl mt-0.5">📬</span>
            <div>
              <p className="font-semibold text-[#2C2A26] mb-1">A story shows up every week</p>
              <p className="text-[#5a5550] text-sm leading-relaxed">One story per week, delivered to your inbox on the day you choose. Their interest isn&apos;t decoration — dinosaurs solve the actual mystery. Space is where the plot lives.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl mt-0.5">😄</span>
            <div>
              <p className="font-semibold text-[#2C2A26] mb-1">Tap a mood. The next story adapts.</p>
              <p className="text-[#5a5550] text-sm leading-relaxed">After every story, five emojis appear. Parent taps one. Next week&apos;s story starts from where your kid actually is. No other bedtime product does this.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl mt-0.5">📖</span>
            <div>
              <p className="font-semibold text-[#2C2A26] mb-1">Read it. Five minutes. Done.</p>
              <p className="text-[#5a5550] text-sm leading-relaxed">No app to open. No account to log into. The story is right there in your inbox. Open it, read it aloud, lights out.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-xl mx-auto px-6 py-12 border-t border-[#e8ddd0]">
        <h2
          className="text-2xl font-bold text-[#2C2A26] text-center mb-8"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          From parents who actually use it
        </h2>
        <div className="space-y-5">
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
            <p className="text-[#2C2A26] text-base leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              &ldquo;My son asked me how I knew the dinosaur&apos;s name. I told him I had a secret writer friend. He believed me for three weeks.&rdquo;
            </p>
            <p className="text-[#bbb] text-xs">— Sarah M., mom of a 6-year-old T-rex obsessive</p>
          </div>
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
            <p className="text-[#2C2A26] text-base leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              &ldquo;I was spending 20 minutes every night improvising stories I&apos;d mostly forget by morning. This just lands in my inbox. I didn&apos;t know I needed it until I had it.&rdquo;
            </p>
            <p className="text-[#bbb] text-xs">— Marcus T., dad of two, ages 5 and 8</p>
          </div>
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-6">
            <p className="text-[#2C2A26] text-base leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              &ldquo;We tried the app version of one of these services. We stopped using it after two weeks because nobody wanted to find their phone at bedtime. Email just works.&rdquo;
            </p>
            <p className="text-[#bbb] text-xs">— Priya K., mom of a 9-year-old space nerd</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-xl mx-auto px-6 py-12 border-t border-[#e8ddd0]">
        <h2
          className="text-2xl font-bold text-[#2C2A26] text-center mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Simple pricing
        </h2>
        <p className="text-center text-[#5a5550] text-sm mb-8">One story every week, on the day you choose.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-7 text-center">
            <p className="text-[#5a5550] text-sm mb-2">Monthly</p>
            <p className="text-4xl font-bold text-[#2C2A26] mb-1">$9.99</p>
            <p className="text-[#bbb] text-sm mb-2">per month</p>
            <p className="text-[#aaa] text-xs mb-5">One story every week, on the day you choose</p>
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
            <p className="text-[#666] text-sm mb-2">$7.50/month · billed once</p>
            <p className="text-[#555] text-xs mb-5">One story every week, on the day you choose</p>
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

      {/* Final CTA */}
      <section className="max-w-xl mx-auto px-6 py-14 text-center">
        <p
          className="text-3xl font-bold text-[#2C2A26] mb-4 leading-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Tonight&apos;s story is waiting.
        </p>
        <p className="text-[#5a5550] text-base mb-8 leading-relaxed">
          Two minutes to set up. One story tonight, free. Then one every week — already written, already personalized, already in your inbox.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#E8A838] text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          Get your child&apos;s first story free tonight
        </Link>
        <p className="text-sm text-[#bbb] mt-3">
          Tonight is free. No credit card. After that, one story every week on the day you pick — cancel any time.
        </p>
      </section>

      <footer className="border-t border-[#e8ddd0] py-8 text-center">
        <p className="text-[#ccc] text-sm">No app. No login. No prep. Just stories that know your kid.</p>
      </footer>

    </main>
  )
}
