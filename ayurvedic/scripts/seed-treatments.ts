/**
 * One-shot Sanity seed script for Treatments + Treatment Categories.
 *
 * Usage:
 *   1. Make sure .env.local has NEXT_PUBLIC_SANITY_PROJECT_ID,
 *      NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN.
 *   2. From the ayurvedic/ directory, run:
 *        npx tsx scripts/seed-treatments.ts
 *
 * Behaviour:
 *   - Categories use stable `_id`s and are upserted with `createOrReplace`,
 *     so re-running the script is idempotent for categories.
 *   - Treatments are CREATED on each run. To wipe-and-reseed, run with the
 *     `--reset` flag, which will first delete every existing treatment.
 */

import 'dotenv/config'
import { createClient } from '@sanity/client'

import seedData from './seed-data/treatments-seed.json'

interface SeedCategory {
  _id: string
  title: string
  order: number
}

interface SeedTreatment {
  title: string
  duration: string
  description: string
  categoryRef: string
  requiresConsultation: boolean
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    '[seed] Missing env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN in .env.local',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-10-01',
  useCdn: false,
})

async function run() {
  const reset = process.argv.includes('--reset')
  const { categories, treatments } = seedData as {
    categories: SeedCategory[]
    treatments: SeedTreatment[]
  }

  if (reset) {
    console.log('[seed] --reset flag set: deleting existing treatments…')
    await client.delete({ query: '*[_type == "treatment"]' })
  }

  console.log(`[seed] Upserting ${categories.length} categories…`)
  for (const cat of categories) {
    await client.createOrReplace({
      _id: cat._id,
      _type: 'treatmentCategory',
      title: cat.title,
      order: cat.order,
    })
  }

  console.log(`[seed] Creating ${treatments.length} treatments…`)
  for (const t of treatments) {
    await client.create({
      _type: 'treatment',
      title: t.title,
      duration: t.duration,
      description: t.description,
      requiresConsultation: t.requiresConsultation,
      category: { _type: 'reference', _ref: t.categoryRef },
    })
  }

  console.log(
    `[seed] Done — seeded ${categories.length} categories and ${treatments.length} treatments.`,
  )
}

run().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
