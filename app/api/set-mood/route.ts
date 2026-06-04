import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const VALID_MOODS = ['happy', 'sleepy', 'silly', 'excited', 'anxious']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const mood = searchParams.get('mood')

  if (!token || !mood || !VALID_MOODS.includes(mood)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const { data: subscriber } = await supabaseAdmin
    .from('sillytales_subscribers')
    .select('id')
    .eq('magic_token', token)
    .gt('magic_token_expires_at', new Date().toISOString())
    .single()

  if (!subscriber) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const { data: prefs } = await supabaseAdmin
    .from('sillytales_preferences')
    .select('id, child_name')
    .eq('subscriber_id', subscriber.id)
    .single()

  if (!prefs) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  await supabaseAdmin
    .from('sillytales_preferences')
    .update({ mood })
    .eq('subscriber_id', subscriber.id)

  const childName = (prefs as { id: string; child_name: string }).child_name
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.redirect(
    new URL(`/mood-set?mood=${mood}&name=${encodeURIComponent(childName)}`, appUrl)
  )
}
