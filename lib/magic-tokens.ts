import { supabaseAdmin } from './supabase'
import { randomUUID } from 'crypto'

// Generate a magic link token for a subscriber (for preferences/pause/unsub links)
export async function generateMagicToken(subscriberId: string): Promise<string> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await supabaseAdmin
    .from('storydrop_subscribers')
    .update({ magic_token: token, magic_token_expires_at: expiresAt.toISOString() })
    .eq('id', subscriberId)

  return token
}

// Validate a magic token and return the subscriber ID
export async function validateMagicToken(token: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('storydrop_subscribers')
    .select('id, magic_token_expires_at')
    .eq('magic_token', token)
    .single()

  if (!data) return null
  if (new Date(data.magic_token_expires_at) < new Date()) return null

  return data.id
}
