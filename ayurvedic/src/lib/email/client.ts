import 'server-only'
import { Resend } from 'resend'

let cached: Resend | null = null
export function resend(): Resend {
  if (cached) return cached
  const key = process.env.RESEND_API_KEY
  if (!key || key.startsWith('your-')) {
    throw new Error('RESEND_API_KEY is not configured.')
  }
  cached = new Resend(key)
  return cached
}

export const EMAIL_FROM = 'Kerala Ayurvedic Lifestyle <noreply@onboarding.resend.dev>'
// TODO: swap to verified production sender once the domain is configured in Resend.
