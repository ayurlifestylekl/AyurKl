/**
 * Centralised Cal.com configuration. Single source of truth for the embed —
 * the username and event slugs live in env so the marketing team can change
 * them without a code deploy.
 *
 * Two event types back the booking flows:
 *   - CONSULTATION  → free 30-min intake with Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu)
 *   - TREATMENT     → treatment session (picker on /book/treatment feeds
 *                     the treatment name into the embed's custom question)
 *
 * v1 is embed-only. The webhook → Supabase sync is parked (CALCOM_API_KEY /
 * CALCOM_WEBHOOK_SECRET in .env stay unused until v2).
 */

const DEFAULT_USERNAME = 'ayurvediclifestylekl'
const DEFAULT_CONSULTATION_EVENT = 'free-consultation'
const DEFAULT_TREATMENT_EVENT = 'treatment-booking'

export const calUsername =
  process.env.NEXT_PUBLIC_CAL_USERNAME || DEFAULT_USERNAME

export const calConsultationEvent =
  process.env.NEXT_PUBLIC_CAL_CONSULTATION_EVENT || DEFAULT_CONSULTATION_EVENT

export const calTreatmentEvent =
  process.env.NEXT_PUBLIC_CAL_TREATMENT_EVENT || DEFAULT_TREATMENT_EVENT

export type CalEventKey = 'consultation' | 'treatment'

export function calEventSlug(key: CalEventKey): string {
  return key === 'consultation' ? calConsultationEvent : calTreatmentEvent
}

/**
 * `calLink` is what `@calcom/embed-react` expects — e.g.
 * `ayurvediclifestylekl/treatment-booking`. No leading slash, no host.
 */
export function calLink(key: CalEventKey): string {
  return `${calUsername}/${calEventSlug(key)}`
}

/**
 * Public URL on cal.com — used for the "open in new tab" fallback if the
 * embed ever fails to load (e.g. ad blocker). Not wired by default, kept
 * here so there's one obvious place to reach for it.
 */
export function calPublicUrl(key: CalEventKey): string {
  return `https://cal.com/${calLink(key)}`
}

/**
 * UI theme config passed to `getCalApi().ui()`. Matches the clinic's palette
 * (Turmeric Gold accent on the Cal.com booking page).
 */
export const calUiConfig = {
  theme: 'light' as const,
  styles: {
    branding: {
      brandColor: '#D4A373',
    },
  },
  hideEventTypeDetails: false,
  layout: 'month_view' as const,
}

/**
 * Namespaces keep multiple embeds on the same page isolated — the
 * consultation and treatment pages each use their own so their UI configs
 * don't collide if they end up rendered together.
 */
export const calNamespace = {
  consultation: 'kal-consultation',
  treatment: 'kal-treatment',
} as const
