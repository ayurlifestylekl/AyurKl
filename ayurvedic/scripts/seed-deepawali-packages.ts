/**
 * Seeds the 4 Deepawali promo packages (client-approved via WhatsApp, see
 * Deepawali-Promo-Proposal.pdf) into the `packages` table. Each is tied to
 * the closest matching existing treatment, used for the "relevant treatment
 * page" promo banner.
 *
 * Idempotent: upserts by slug, safe to re-run.
 * Run: npx tsx scripts/seed-deepawali-packages.ts
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}
const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

const PACKAGES = [
  {
    slug: 'abhyangam-package',
    name: 'Abhyangam Package',
    price_rm: 750,
    session_count: 10,
    description: '10 sessions of 1-hour Full Body Abhyangam.',
    // "Abhyangam (Full Body Oil Massage)" — Massage & Rehab Therapies
    treatment_id: '0fb8701d-5ee9-4814-b7ed-daf2b3dfe998',
    sort_order: 1,
  },
  {
    slug: 'complete-relaxing-package',
    name: 'Complete Relaxing Package',
    price_rm: 1000,
    session_count: 10,
    description: '10 sessions of 90-minute Full Body Abhyangam with Herbal Kizhi.',
    // "Abhyangam with Kizhi" — Massage & Rehab Therapies
    treatment_id: 'c4caf8f1-04fd-4c1c-b482-5ee76dfd3844',
    sort_order: 2,
  },
  {
    slug: 'deepawali-special-udwarthanam',
    name: 'Deepawali Special Udwarthanam Package',
    price_rm: 1449,
    session_count: 10,
    description: '10 full 90-minute sessions of Udwarthanam and Herbal Steam Bath.',
    // "Udwarthanam + Steam Bath" — Weight Management Therapy
    treatment_id: 'bb22b45f-a030-429b-8055-e2b3e668a4d2',
    sort_order: 3,
  },
  {
    slug: 'sirodhaara-package',
    name: 'Sirodhaara Package',
    price_rm: 1000,
    session_count: 10,
    description: '10 sessions of 1-hour Sirodhaara with Head Massage.',
    // "Sirodhaara — Head, Neck & Foot Massage" — Stress Relieving & Sleep
    treatment_id: '34c4b2a2-305b-40f1-ae73-bfbfb021a0c7',
    sort_order: 4,
  },
] as const

async function main() {
  for (const p of PACKAGES) {
    const { error } = await sb.from('packages').upsert(
      {
        slug: p.slug,
        name: p.name,
        price_rm: p.price_rm,
        session_count: p.session_count,
        description: p.description,
        treatment_id: p.treatment_id,
        validity_days: 365,
        // "Package available till November 30th 2026" — end of day, Malaysia time.
        available_until: '2026-11-30T23:59:59+08:00',
        sort_order: p.sort_order,
        is_active: true,
      },
      { onConflict: 'slug' },
    )
    if (error) {
      console.error(`✗ ${p.slug}: ${error.message}`)
    } else {
      console.log(`✓ ${p.slug} — RM${p.price_rm}, ${p.session_count} sessions`)
    }
  }
}

main()
