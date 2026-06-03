// Lazy SDK clients — never instantiated at module level (env vars unavailable during build)
import Anthropic from '@anthropic-ai/sdk'
import Stripe from 'stripe'
import { Resend } from 'resend'

let _anthropic: Anthropic | null = null
let _stripe: Stripe | null = null
let _resend: Resend | null = null

export function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return _stripe
}

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
