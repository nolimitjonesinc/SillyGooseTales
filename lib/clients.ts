// Lazy SDK clients — never instantiated at module level (env vars unavailable during build)
import Anthropic from '@anthropic-ai/sdk'
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'
import { Resend } from 'resend'

let _anthropic: Anthropic | null = null
let _resend: Resend | null = null
let _lsInitialized = false

export function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

export function initLemonSqueezy() {
  if (!_lsInitialized) {
    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! })
    _lsInitialized = true
  }
}

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
