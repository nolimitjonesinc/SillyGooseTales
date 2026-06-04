import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subscriberId = searchParams.get('subscriber_id')

  if (!subscriberId) {
    return NextResponse.json({ error: 'subscriber_id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('sillytales_preferences')
    .select('*')
    .eq('subscriber_id', subscriberId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Preferences not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
