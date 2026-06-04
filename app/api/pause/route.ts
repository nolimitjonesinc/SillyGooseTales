import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateMagicToken } from '@/lib/magic-tokens'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const subscriberId = await validateMagicToken(token)
  if (!subscriberId) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })

  await supabaseAdmin
    .from('sillytales_subscribers')
    .update({ subscription_status: 'paused' })
    .eq('id', subscriberId)

  // Cancel queued stories
  await supabaseAdmin
    .from('sillytales_story_queue')
    .update({ status: 'failed' })
    .eq('subscriber_id', subscriberId)
    .eq('status', 'queued')

  return NextResponse.redirect(new URL('/paused', req.url))
}
