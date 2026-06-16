import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

function isAdminAuthed(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key')
  const expected = process.env.ADMIN_API_KEY
  if (!key || !expected) return false
  return crypto.timingSafeEqual(Buffer.from(key), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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
