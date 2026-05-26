/**
 * One-shot: generate slugs for every existing treatmentCategory and treatment
 * that doesn't already have one, derived from the document title.
 *
 * Run: `npx tsx scripts/backfill-treatment-slugs.ts`
 * Requires `SANITY_API_WRITE_TOKEN` in env.
 */
import 'dotenv/config'
import { createClient } from '@sanity/client'
import {
  projectId,
  dataset,
  apiVersion,
  writeToken,
} from '../src/sanity/env'

if (!projectId || !writeToken) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

interface Doc { _id: string; title: string; slug?: { current?: string } | null }

async function backfill(type: 'treatmentCategory' | 'treatment') {
  const docs = await client.fetch<Doc[]>(
    `*[_type == $type && !defined(slug.current)] { _id, title, slug }`,
    { type },
  )
  if (docs.length === 0) {
    console.log(`[${type}] no docs need slugs`)
    return
  }
  console.log(`[${type}] backfilling ${docs.length} document(s)`)

  const taken = new Set<string>(
    await client.fetch<string[]>(
      `*[_type == $type && defined(slug.current)].slug.current`,
      { type },
    ),
  )

  let tx = client.transaction()
  for (const doc of docs) {
    const candidate = slugify(doc.title)
    if (!candidate) {
      console.warn(`  · ${doc._id}: title yields empty slug, skipping`)
      continue
    }
    let unique = candidate
    let n = 2
    while (taken.has(unique)) {
      unique = `${candidate}-${n++}`
    }
    taken.add(unique)
    console.log(`  · ${doc._id} → ${unique}`)
    tx = tx.patch(doc._id, (p) =>
      p.set({ slug: { _type: 'slug', current: unique } }),
    )
  }
  const result = await tx.commit()
  console.log(`[${type}] committed ${result.results.length} patch(es)`)
}

async function main() {
  await backfill('treatmentCategory')
  await backfill('treatment')
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
