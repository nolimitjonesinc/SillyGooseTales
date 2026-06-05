import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singletons — env vars aren't available at module evaluation during build
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return (_supabase as unknown as Record<string, unknown>)[prop as string]
  }
})

// Server-side (service role) — bypasses RLS for cron jobs and admin
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    }
    return (_supabaseAdmin as unknown as Record<string, unknown>)[prop as string]
  }
})

export type Subscriber = {
  id: string
  email: string
  lemonsqueezy_customer_id: string | null
  lemonsqueezy_subscription_id: string | null
  subscription_status: 'free_trial' | 'active' | 'paused' | 'at_risk' | 're_engagement_paused' | 'churned' | 'cancelled'
  is_admin: boolean
  magic_token: string | null
  magic_token_expires_at: string | null
  created_at: string
}

export type Preferences = {
  id: string
  subscriber_id: string
  child_name: string
  child_age: number
  interests: string[]
  themes_include: string[]
  themes_exclude: string[]
  tone_profile: string
  tone_profiles: string[] | null
  mood: 'happy' | 'sleepy' | 'silly' | 'excited' | 'anxious' | null
  delivery_day: string
  delivery_slot: 'morning' | 'afternoon' | 'evening'
  timezone: string
  story_history: string[]
  character_state: {
    name: string
    type: string
    quirk: string
    last_event: string
  } | null
  next_delivery_at: string | null
}

export type StoryQueueItem = {
  id: string
  subscriber_id: string
  story_title: string
  story_body: string
  story_token: string
  illustration_url: string | null
  delivery_at: string
  status: 'queued' | 'delivered' | 'failed' | 'flagged'
  retry_count: number
  qc_score: QCScore | null
  created_at: string
  input_tokens: number
  output_tokens: number
  qc_input_tokens: number
  qc_output_tokens: number
}

export type QCScore = {
  protagonist_agency: boolean
  interest_load_bearing: boolean
  no_moral_announcement: boolean
  word_count_in_range: boolean
  tone_match: boolean
  passed: boolean
  failure_notes: string
}
