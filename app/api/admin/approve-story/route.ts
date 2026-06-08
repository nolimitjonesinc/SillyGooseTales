import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { storyId } = await req.json()
  if (!storyId) return NextResponse.json({ error: 'storyId required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('sillytales_story_queue')
    .update({ status: 'queued' })
    .eq('id', storyId)
    .eq('status', 'flagged')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
