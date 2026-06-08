import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { storyId, subscriberId } = await req.json()
  if (!storyId || !subscriberId) {
    return NextResponse.json({ error: 'storyId and subscriberId required' }, { status: 400 })
  }

  // Delete the flagged story so the rate limit check passes
  await supabaseAdmin
    .from('sillytales_story_queue')
    .delete()
    .eq('id', storyId)

  // Trigger fresh generation using overrideDeliveryAt = now (immediate delivery)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const res = await fetch(`${appUrl}/api/generate-story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriberId,
      overrideDeliveryAt: new Date().toISOString(),
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? 'Generation failed' }, { status: res.status })
  }

  return NextResponse.json({ success: true, title: data.title })
}
