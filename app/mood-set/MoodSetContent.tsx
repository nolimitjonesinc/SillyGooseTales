'use client'
import { useSearchParams } from 'next/navigation'

const MOOD_MESSAGES: Record<string, { emoji: string; message: string }> = {
  happy: { emoji: '😄', message: "next story will be full of joy and celebration" },
  sleepy: { emoji: '😴', message: "next story will be soft, cozy, and perfect for drifting off" },
  silly: { emoji: '🤪', message: "next story will be gloriously, wonderfully silly" },
  excited: { emoji: '🤩', message: "next story will match that big excited energy" },
  anxious: { emoji: '🤗', message: "next story will be gentle and help those worries feel smaller" },
}

export default function MoodSetContent() {
  const params = useSearchParams()
  const mood = params.get('mood') ?? 'happy'
  const name = params.get('name') ?? 'their'
  const info = MOOD_MESSAGES[mood] ?? MOOD_MESSAGES.happy

  return (
    <div className="min-h-screen bg-[#FDF6EE] flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="text-6xl mb-6">{info.emoji}</div>
        <h1 className="text-2xl font-bold text-[#2C2A26] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Got it!
        </h1>
        <p className="text-[#5C5A56] text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
          {name}&apos;s {info.message}.
        </p>
        <p className="text-[#aaaaaa] text-sm mt-8">
          You can close this tab.
        </p>
      </div>
    </div>
  )
}
