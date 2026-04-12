'use server'

import { createClient } from '@/lib/supabase/server'

export type ContactIntent = 'treatment' | 'product' | 'corporate' | 'other'

export interface ContactInput {
  intent: ContactIntent
  name: string
  phone: string
  email: string
  message: string
}

type Result = { ok: true } | { ok: false; error: string }

const VALID_INTENTS: readonly ContactIntent[] = [
  'treatment',
  'product',
  'corporate',
  'other',
] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s()]{8,30}$/

type ValidationResult =
  | { ok: true; data: ContactInput }
  | { ok: false; error: string }

function validate(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Invalid submission.' }
  }
  const i = raw as Record<string, unknown>
  const intent = typeof i.intent === 'string' ? i.intent.trim() : ''
  const name = typeof i.name === 'string' ? i.name.trim() : ''
  const phone = typeof i.phone === 'string' ? i.phone.trim() : ''
  const email = typeof i.email === 'string' ? i.email.trim() : ''
  const message = typeof i.message === 'string' ? i.message.trim() : ''

  if (!VALID_INTENTS.includes(intent as ContactIntent)) {
    return { ok: false, error: 'Please choose what your message is about.' }
  }
  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: 'Please tell us your name.' }
  }
  if (!PHONE_RE.test(phone)) {
    return {
      ok: false,
      error: 'Please enter a valid phone number so we can reply on WhatsApp.',
    }
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (message.length < 10 || message.length > 2000) {
    return {
      ok: false,
      error: 'Please write a message between 10 and 2000 characters.',
    }
  }

  return {
    ok: true,
    data: {
      intent: intent as ContactIntent,
      name,
      phone,
      email,
      message,
    },
  }
}

/**
 * Server action — validates a contact form submission and inserts it into
 * `public.contact_messages`. The anon-key client is sufficient because the
 * table's RLS policy permits inserts from `anon` / `authenticated`.
 */
export async function submitContactMessage(raw: unknown): Promise<Result> {
  const validation = validate(raw)
  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  const supabase = await createClient()
  // Supabase v2.101+ requires a Database type with __InternalSupabase metadata
  // for INSERT type inference; our hand-maintained Database type predates that,
  // so we cast here. The runtime shape is validated by `validate()` above and
  // the column contract is enforced by the table's CHECK constraints.
  const { error } = await supabase
    .from('contact_messages')
    .insert(validation.data as never)

  if (error) {
    console.error('[contact] insert failed:', error)
    return {
      ok: false,
      error:
        'Something went wrong on our side. Please try WhatsApp instead — we reply fastest there.',
    }
  }

  return { ok: true }
}
