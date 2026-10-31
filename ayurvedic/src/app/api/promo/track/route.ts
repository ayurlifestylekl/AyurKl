import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'
import { DEEPAWALI_PROMO, isPromoTrackingOpen, parsePromoEvent } from '@/lib/packages/promo-events'

export const dynamic = 'force-dynamic'

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse/i
const MAX_BODY_BYTES = 300
const MAX_EVENTS_PER_MINUTE = 30

// Best-effort per-instance cap on a public endpoint. Keys stay in memory only,
// so the "no IP addresses stored" promise on promo_events still holds.
const recentHits = new Map<string, { count: number; resetAt: number }>()

function overLimit(key: string, now: number): boolean {
  const hit = recentHits.get(key)
  if (!hit || hit.resetAt <= now) {
    if (recentHits.size > 5000) recentHits.clear()
    recentHits.set(key, { count: 1, resetAt: now + 60_000 })
    return false
  }
  hit.count += 1
  return hit.count > MAX_EVENTS_PER_MINUTE
}

/** Counts one promo button press. Always answers 204 so a browser never sees tracking trouble. */
export async function POST(req: NextRequest) {
  const done = new NextResponse(null, { status: 204 })

  if (!isPromoTrackingOpen()) return done
  if (BOT_UA.test(req.headers.get('user-agent') ?? '')) return done

  const origin = req.headers.get('origin')
  if (!origin || !origin.endsWith(`//${req.headers.get('host')}`)) return done

  const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (overLimit(ip, Date.now())) return done

  const text = await req.text().catch(() => '')
  if (!text || text.length > MAX_BODY_BYTES) return done

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return done
  }
  const parsed = parsePromoEvent(raw)
  if (!parsed) return done

  const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await sb.from('promo_events').insert({
    // Local and preview clicks go under a separate name so they never reach the client's numbers.
    promo: process.env.VERCEL_ENV === 'production' ? DEEPAWALI_PROMO : `${DEEPAWALI_PROMO}-test`,
    event: parsed.event,
    placement: parsed.placement,
    package_slug: parsed.packageSlug ?? null,
  })
  if (error) console.error('[promo/track] insert failed:', error.message)

  return done
}
