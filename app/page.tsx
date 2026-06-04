'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FDF6EE]">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-[#E8A838] text-sm font-medium tracking-widest uppercase mb-6">
          Silly Goose Tales
        </p>
        <h1 className="text-5xl font-bold text-[#2C2A26] leading-tight mb-6"
          style={{ fontFamily: 'Georgia, serif' }}>
          A story. Every week.<br />Just for them.
        </h1>
        <p className="text-xl text-[#5a5550] mb-10 leading-relaxed">
          Personalized bedtime stories delivered to your inbox.
          Set it once. Let the stories arrive.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#E8A838] text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-[#d4952d] transition-colors"
        >
          Get your child&apos;s first story free tonight
        </Link>
        <p className="text-sm text-[#aaa] mt-4">No credit card. No app. Story arrives in your inbox.</p>
      </section>

      {/* How it works */}
      <section className="max-w-2xl mx-auto px-6 py-16 border-t border-[#e8ddd0]">
        <h2 className="text-2xl font-bold text-[#2C2A26] text-center mb-12"
          style={{ fontFamily: 'Georgia, serif' }}>
          Three steps. Then it just works.
        </h2>
        <div className="space-y-8">
          {[
            { n: '1', title: 'Tell us about your child', body: "Name, age, what they love. Takes two minutes." },
            { n: '2', title: 'Pick a story vibe and delivery time', body: "Cozy bedtime? Wild adventure? You choose the feel and when it arrives." },
            { n: '3', title: 'Stories just appear', body: "Every week, a new story written just for them lands in your inbox — ready to read aloud." }
          ].map(step => (
            <div key={step.n} className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-[#E8A838] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {step.n}
              </div>
              <div>
                <h3 className="font-semibold text-[#2C2A26] text-lg mb-1">{step.title}</h3>
                <p className="text-[#5a5550]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-2xl mx-auto px-6 py-16 border-t border-[#e8ddd0]">
        <h2 className="text-2xl font-bold text-[#2C2A26] text-center mb-10"
          style={{ fontFamily: 'Georgia, serif' }}>
          Simple pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#e8ddd0] rounded-2xl p-8 text-center">
            <p className="text-[#5a5550] text-sm mb-2">Monthly</p>
            <p className="text-4xl font-bold text-[#2C2A26] mb-1">$9.99</p>
            <p className="text-[#aaa] text-sm mb-6">per month</p>
            <Link href="/signup?plan=monthly"
              className="block w-full bg-[#2C2A26] text-white py-3 rounded-xl hover:bg-[#1a1917] transition-colors font-medium">
              Start monthly
            </Link>
          </div>
          <div className="bg-[#2C2A26] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#E8A838] text-white text-xs font-bold px-3 py-1 rounded-full">
              SAVE 25%
            </div>
            <p className="text-[#aaa] text-sm mb-2">Annual</p>
            <p className="text-4xl font-bold text-white mb-1">$89.99</p>
            <p className="text-[#666] text-sm mb-6">$7.50/month · billed once</p>
            <Link href="/signup?plan=annual"
              className="block w-full bg-[#E8A838] text-white py-3 rounded-xl hover:bg-[#d4952d] transition-colors font-medium">
              Start annual
            </Link>
          </div>
        </div>
        <p className="text-center text-[#aaa] text-sm mt-6">
          Try free first — no credit card needed.{' '}
          <Link href="/signup" className="underline text-[#5a5550]">Get one story tonight →</Link>
        </p>
      </section>

      <footer className="border-t border-[#e8ddd0] py-8 text-center">
        <p className="text-[#ccc] text-sm">Silly Goose Tales · Made with care for curious kids</p>
      </footer>
    </main>
  )
}
