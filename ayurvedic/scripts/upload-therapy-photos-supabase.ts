/**
 * Uploads the client's real therapy photo set (67-position brief, see
 * ../../Kerala Ayurvedic Therapy Photos/) into Supabase Storage + the
 * `treatments` table (the storefront's actual image source — see
 * lib/storefront/treatments.ts). Only touches treatments that have a
 * matching file in the folder; everything else is left exactly as-is.
 *
 * Position → slug mapping (POSITION_MAP below) was read directly from the
 * live `treatments` + `treatment_categories` tables, ordered by category
 * sort_order then treatment sort_order — that reconstructs the 1–67 menu
 * position used by the photo brief and the numbered filenames.
 *
 * Each source image is resized (max 2400px wide, never upscaled) and
 * converted to JPG quality ~82 via macOS `sips` before upload, since
 * several originals are 12–16MB.
 *
 * Run (dry run — default, writes nothing):
 *   npx tsx scripts/upload-therapy-photos-supabase.ts
 * Run for real:
 *   npx tsx scripts/upload-therapy-photos-supabase.ts --apply
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()
import { createClient } from '@supabase/supabase-js'
import { readdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}
const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

const PHOTOS_DIR = path.resolve(__dirname, '../../Kerala Ayurvedic Therapy Photos')
const BUCKET = 'treatment-images'
const APPLY = process.argv.includes('--apply')

interface PositionEntry {
  position: number
  id: string
  slug: string
  title: string
}

// Read from the live `treatments` + `treatment_categories` tables, ordered
// by category sort_order then treatment sort_order. Do not hand-edit —
// regenerate from the DB if the catalogue changes.
//
// NOTE: #15 and #23 share the identical slug "abhyangam-full-body-oil-massage"
// (same title, different categories: Massage vs Oldage Care) — that's why
// every lookup/update/storage-path below is keyed by `id`, never `slug`.
const POSITION_MAP: PositionEntry[] = [
  { position: 1, id: 'd33bf2a5-3580-427e-ad2e-30dcb4579e66', slug: 'ayurveda-rejuvenating-face-massage', title: 'Ayurveda Rejuvenating Face Massage' },
  { position: 2, id: 'c749c298-e458-43e6-bc26-bb3f02a4174c', slug: 'vyanga-care-pigmentation', title: 'Vyanga Care (Pigmentation)' },
  { position: 3, id: '45495619-5866-448e-aa63-d5057fdf2584', slug: 'ayurvedic-pimple-care', title: 'Ayurvedic Pimple Care' },
  { position: 4, id: '7f7391ab-6d11-4498-8abe-aa1672b5e952', slug: 'ayurvedic-herbal-facial', title: 'Ayurvedic Herbal Facial' },
  { position: 5, id: 'cd8d3cf4-50a5-4e63-aa2b-d2bdd6d9ca23', slug: 'njavara-milk-facial', title: 'Njavara Milk Facial' },
  { position: 6, id: 'eb62ac13-ff67-442e-a0ea-4aff0e6d8743', slug: 'paada-abhyangam-foot-massage', title: 'Paada-Abhyangam (Foot Massage)' },
  { position: 7, id: 'bedbf250-972e-4e8f-a418-391e08adcd8e', slug: 'head-massage', title: 'Head Massage' },
  { position: 8, id: '6e88f574-d4d3-4648-9246-09dc5db87d03', slug: 'abhyangam-partial', title: 'Abhyangam (Partial)' },
  { position: 9, id: 'd536a87e-788d-48cb-850a-fa1f35894a5d', slug: 'leg-and-foot-massage-with-kizhi', title: 'Leg and Foot Massage with Kizhi' },
  { position: 10, id: '0a2bb13f-2948-4543-9586-6e6895844755', slug: 'siro-abhyangam-head-massage', title: 'Siro-Abhyangam (Head Massage)' },
  { position: 11, id: 'a2c51096-b9df-47ac-a359-bfc30d2ea9c4', slug: 'neck-and-shoulder-massage-with-kizhi', title: 'Neck and Shoulder Massage with Kizhi' },
  { position: 12, id: '0b43dfc4-5d8c-4493-bfc5-1b856b81c790', slug: 'low-back-leg-massage-with-kizhi', title: 'Low-Back & Leg Massage with Kizhi' },
  { position: 13, id: 'b06a6d25-2616-445b-a7d9-26735b64fb2c', slug: 'spinal-massage-with-kizhi', title: 'Spinal Massage with Kizhi' },
  { position: 14, id: 'b8cc5b69-77b0-4dd8-8b3e-9a6f39bd13e2', slug: 'lymphatic-drainage-massage', title: 'Lymphatic Drainage Massage' },
  { position: 15, id: '0fb8701d-5ee9-4814-b7ed-daf2b3dfe998', slug: 'abhyangam-full-body-oil-massage', title: 'Abhyangam (Full Body Oil Massage)' },
  { position: 16, id: '8b3dc533-c123-4b11-86d5-c17d72574ded', slug: 'abhyangam-with-kashaya-dhaara', title: 'Abhyangam with Kashaya Dhaara' },
  { position: 17, id: 'c4caf8f1-04fd-4c1c-b482-5ee76dfd3844', slug: 'abhyangam-with-kizhi', title: 'Abhyangam with Kizhi' },
  { position: 18, id: 'efbc2455-23c0-4dfa-b79d-ec6fb5fc87c1', slug: 'abhyangam-with-steam-bath', title: 'Abhyangam with Steam Bath' },
  { position: 19, id: '3424d767-1add-4357-8698-df9cba6b7ce0', slug: 'abhyangam-sirodhaara', title: 'Abhyangam & Sirodhaara' },
  { position: 20, id: '34c4b2a2-305b-40f1-ae73-bfbfb021a0c7', slug: 'sirodhaara-head-neck-foot-massage', title: 'Sirodhaara — Head, Neck & Foot Massage' },
  { position: 21, id: 'e98354b2-ae9e-42e2-a800-54f85f4dda43', slug: 'siro-dhaara-tailam-neck-massage', title: 'Siro-Dhaara (Tailam) & Neck Massage' },
  { position: 22, id: '90b4a601-e4f9-4431-83fa-a52105812fba', slug: 'siro-abhyangam-paada-abhyangam', title: 'Siro-Abhyangam & Paada-Abhyangam' },
  { position: 23, id: 'c8cb90b1-73cf-4041-863b-acefbef25de4', slug: 'abhyangam-full-body-oil-massage', title: 'Abhyangam (Full Body Oil Massage)' },
  { position: 24, id: '53d1faff-7d88-4c0b-aa74-bac6e345c118', slug: 'abhyangam-with-podi-kizhi-heat-compress', title: 'Abhyangam with Podi-Kizhi (Heat Compress)' },
  { position: 25, id: '63c8d7df-4bb6-447c-a4b6-cafc582359a7', slug: 'njavara-kizhi-full-body', title: 'Njavara Kizhi — Full Body' },
  { position: 26, id: 'c2ef3d06-c657-4df7-bead-db77ae353cd3', slug: 'abhyangam-with-sirodhaara', title: 'Abhyangam with Sirodhaara' },
  { position: 27, id: 'c084a078-e6bd-45d0-a41a-56ea8287e26d', slug: 'ayurvedic-scalp-hair-oil-massage', title: 'Ayurvedic Scalp & Hair Oil Massage' },
  { position: 28, id: 'a012032e-af38-4bb6-94a0-a0dc69dc6997', slug: 'ayurveda-hair-treatment', title: 'Ayurveda Hair Treatment' },
  { position: 29, id: '59d20487-5222-4839-88fd-e865d480c3e3', slug: 'ayurveda-hair-scalp-therapy', title: 'Ayurveda Hair & Scalp Therapy' },
  { position: 30, id: '324d4b6d-77b5-42a2-a699-21b15c89ecd8', slug: 'upper-body-herbal-scrub', title: 'Upper Body Herbal Scrub' },
  { position: 31, id: '6f5a3b27-a187-49cf-8485-d7176303e8b5', slug: 'abhyangam-skin-specific-oil-massage', title: 'Abhyangam (Skin Specific Oil Massage)' },
  { position: 32, id: 'c6e1e3c8-191a-45da-a96c-c2ca582ab73d', slug: 'upper-back-pigmentation-treatment', title: 'Upper Back Pigmentation Treatment' },
  { position: 33, id: '10bd73f2-ce56-45d2-8d91-114aff41a105', slug: 'udvarthanam-full-body-herbal-scrub', title: 'Udvarthanam (Full Body Herbal Scrub)' },
  { position: 34, id: '47ddf956-84ee-4845-aaf7-bb521dbb0f0f', slug: 'ayurvedic-full-body-skin-lightening-therapy-njavara-kizhi', title: 'Ayurvedic Full-Body Skin Lightening Therapy (Njavara Kizhi)' },
  { position: 35, id: '984c4a9c-a67c-47d8-956d-c5b3b2f24800', slug: 'ayurvedic-full-body-exfoliation-therapy-body-scrub-with-steam-bath', title: 'Ayurvedic Full-Body Exfoliation Therapy (Body Scrub with Steam Bath)' },
  { position: 36, id: '7a392ea4-a46d-4e5f-9bc4-341581167c45', slug: 'abhyangam-with-udvarthanam', title: 'Abhyangam with Udvarthanam' },
  { position: 37, id: '5ce1734d-148c-448c-993b-944d8127851f', slug: 'full-body-abhyangam-and-njavara-kizhi', title: 'Full Body Abhyangam and Njavara Kizhi' },
  { position: 38, id: 'b185d262-06f0-457a-be70-d1b0839b28c6', slug: 'full-body-takra-dhaara', title: 'Full Body Takra Dhaara' },
  { position: 39, id: '2810ae07-35b4-4784-b560-4c2c84374d86', slug: 'abhyangam-with-njavara-kizhi-affected-joint-partial-body', title: 'Abhyangam with Njavara Kizhi (Affected Joint / Partial Body)' },
  { position: 40, id: '30bc6524-de35-4a75-b82d-1c87f121df50', slug: 'abhyangam-heat-therapy-herbal-bandage', title: 'Abhyangam — Heat Therapy — Herbal Bandage' },
  { position: 41, id: '31771974-8328-4243-96ed-72ddaee2b384', slug: 'pichu-with-partial-abhyangam-and-kizhi', title: 'Pichu — with Partial Abhyangam and Kizhi' },
  { position: 42, id: '35c4ed8f-0542-413b-9974-b45a0ac448df', slug: 'herbal-bandage-affected-joints', title: 'Herbal Bandage — Affected Joints' },
  { position: 43, id: '2dce46f0-b643-417a-a44f-cc06c68def5a', slug: 'ayurveda-eye-care-eye-wash-netra-patah', title: 'Ayurveda Eye Care (Eye Wash, Netra Patah)' },
  { position: 44, id: '6a8573d0-02c8-4adf-9cc5-5bd4ab23f5b0', slug: 'nasyam', title: 'Nasyam' },
  { position: 45, id: 'b65e4f25-ce60-4000-b779-85485597ac9c', slug: 'ear-treatment-karnapooranam-karnadhoopanam', title: 'Ear Treatment (Karnapooranam & Karnadhoopanam)' },
  { position: 46, id: 'cb9aa0ce-b5bd-4975-9832-549593477164', slug: 'oil-massage-ages-1-to-5', title: 'Oil Massage — Ages 1 to 5' },
  { position: 47, id: 'cc910332-a717-4081-8d7d-6b672c927eac', slug: 'oil-massage-ages-6-to-10', title: 'Oil Massage — Ages 6 to 10' },
  { position: 48, id: '4bcd5abd-4b21-4ba2-9141-9f8c9f846b00', slug: 'oil-massage-ages-11-to-17', title: 'Oil Massage — Ages 11 to 17' },
  { position: 49, id: '6fcba319-a08c-4d5f-91e7-95b1dae36f44', slug: 'head-or-leg-massage-ages-11-to-17', title: 'Head or Leg Massage — Ages 11 to 17' },
  { position: 50, id: 'a039376a-3742-49cd-a00b-a60bb79a8ef0', slug: 'sirodhaara-ages-11-to-17', title: 'Sirodhaara — Ages 11 to 17' },
  { position: 51, id: 'bfa3210b-bfda-4053-a89a-608f9a86b671', slug: 'talam-sirodhaara-ages-12-to-17', title: 'Talam & Sirodhaara — Ages 12 to 17' },
  { position: 52, id: 'b0177245-2293-4b97-9e75-b0356605c4e0', slug: 'oil-massage-and-sirodhaara-ages-12-to-17', title: 'Oil Massage and Sirodhaara — Ages 12 to 17' },
  { position: 53, id: '1c8f56b4-1692-4811-aedd-e0e2f710b4d4', slug: 'abhyangam-with-kizhi-heat-compress', title: 'Abhyangam with Kizhi (Heat Compress)' },
  { position: 54, id: 'c12bf636-ed8b-46f2-aac0-390808cd66e9', slug: 'abhyangam-with-kashaya-dhaara-full-body', title: 'Abhyangam with Kashaya Dhaara (Full Body)' },
  { position: 55, id: 'a4dc31e2-d4f5-4f99-aec2-674f4603f402', slug: 'abhyangam-with-sirodhaara-rehabilitation', title: 'Abhyangam with Sirodhaara (Rehabilitation)' },
  { position: 56, id: '67e6a950-a71d-499c-bd72-418c48b7ab26', slug: 'abhyangam-with-njavara-kizhi-full-body', title: 'Abhyangam with Njavara Kizhi (Full Body)' },
  { position: 57, id: '8d287e1e-ab95-4127-974e-f73842386123', slug: 'udwarthanam-with-kashaya-dhaara', title: 'Udwarthanam with Kashaya Dhaara' },
  { position: 58, id: 'bb22b45f-a030-429b-8055-e2b3e668a4d2', slug: 'udwarthanam-steam-bath', title: 'Udwarthanam + Steam Bath' },
  { position: 59, id: '64910179-2e8a-4b82-bd79-3c460454b210', slug: 'jaanu-vasti-knee-care', title: 'Jaanu Vasti (Knee Care)' },
  { position: 60, id: '3c395292-ccfb-4e2d-9ff4-3f044793724b', slug: 'kati-vasti-lower-back-care', title: 'Kati Vasti (Lower Back Care)' },
  { position: 61, id: '7767d866-2d77-468c-98e2-51ad146cabe9', slug: 'greeva-vasti-neck-care', title: 'Greeva Vasti (Neck Care)' },
  { position: 62, id: '1a69c8e4-2f17-47bd-b922-4d7af3b9d9f9', slug: 'uro-vasti-chest-care', title: 'Uro Vasti (Chest Care)' },
  { position: 63, id: '2bb4798d-ab72-4d54-999c-ec3a3ce2a180', slug: 'netra-tarpanam-eye-rejuvenation', title: 'Netra Tarpanam (Eye Rejuvenation)' },
  { position: 64, id: '4ca04516-5e74-4c95-9818-805b3439809a', slug: 'virechana-metabolic-cleansing', title: 'Virechana (Metabolic Cleansing)' },
  { position: 65, id: 'dfc9243e-4aaa-4c34-a77f-cf2fe7569cf4', slug: 'basti-medicated-enema-therapy', title: 'Basti (Medicated Enema Therapy)' },
  { position: 66, id: '672379a1-358e-4def-83ed-80ffafab0165', slug: 'nasya-sensory-respiratory-clearance', title: 'Nasya (Sensory & Respiratory Clearance)' },
  { position: 67, id: 'fb575d26-7e8e-477c-84f7-f62f435636f3', slug: 'post-delivery-care-package-sutika-paricharya', title: 'Post-Delivery Care Package (Sutika Paricharya)' },
]
const POSITION_LOOKUP = new Map(POSITION_MAP.map((e) => [e.position, e]))

// #16, #17, #18 already got paired photos from the earlier
// upload-massage-images-supabase.ts run — never touch them here.
const SKIP_POSITIONS = new Set([16, 17, 18])

interface MatchedFile {
  position: number
  slot: 1 | 2 // 1 = hero/main, 2 = alternate view
  filePath: string
  fileName: string
}

interface Grouped {
  position: number
  id: string
  slug: string
  title: string
  files: MatchedFile[] // 1 or 2, sorted by slot
}

function scanFiles(): { grouped: Grouped[]; unmatched: string[] } {
  const names = readdirSync(PHOTOS_DIR).filter((n) => !n.startsWith('.'))
  const byPosition = new Map<number, MatchedFile[]>()
  const unmatched: string[] = []

  for (const name of names) {
    const m = name.match(/^(\d+)_[^.]*?(?:_(\d))?\.(jpg|jpeg|png|webp)$/i)
    if (!m) {
      unmatched.push(name)
      continue
    }
    const position = Number(m[1])
    const slot = (Number(m[2] ?? '1') as 1 | 2)
    if (!POSITION_LOOKUP.has(position)) {
      unmatched.push(name)
      continue
    }
    const list = byPosition.get(position) ?? []
    list.push({ position, slot, filePath: path.join(PHOTOS_DIR, name), fileName: name })
    byPosition.set(position, list)
  }

  const grouped: Grouped[] = []
  for (const [position, files] of Array.from(byPosition)) {
    if (SKIP_POSITIONS.has(position)) continue
    const entry = POSITION_LOOKUP.get(position)!
    files.sort((a: MatchedFile, b: MatchedFile) => a.slot - b.slot)
    grouped.push({ position, id: entry.id, slug: entry.slug, title: entry.title, files })
  }
  grouped.sort((a, b) => a.position - b.position)
  return { grouped, unmatched }
}

function imageDims(filePath: string): { w: number; h: number } {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], {
    encoding: 'utf8',
  })
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0)
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
  return { w, h }
}

/** Resize (max 2400px wide, never upscale) + convert to JPG q~82 via sips. Returns the processed file path. */
function processImage(filePath: string, outDir: string, outName: string): string {
  const outPath = path.join(outDir, outName)
  execFileSync('sips', [
    '-Z', '2400',
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', '82',
    filePath,
    '--out', outPath,
  ])
  return outPath
}

async function ensureBucket() {
  const { data: buckets } = await sb.storage.listBuckets()
  if (buckets?.some((b) => b.name === BUCKET)) return
  const { error } = await sb.storage.createBucket(BUCKET, { public: true })
  if (error) throw error
  console.log(`created bucket "${BUCKET}"`)
}

// Storage path is keyed by treatment `id`, not `slug` — #15 and #23 share
// the same slug (see POSITION_MAP note), so slug alone would collide.
async function uploadOne(treatmentId: string, storageName: string, localPath: string): Promise<string> {
  const buffer = require('node:fs').readFileSync(localPath)
  const storagePath = `${treatmentId}/${storageName}`
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function currentHeroUrls(ids: string[]): Promise<Map<string, string | null>> {
  const { data, error } = await sb.from('treatments').select('id, hero_image_url').in('id', ids)
  if (error) throw error
  const map = new Map<string, string | null>()
  for (const row of data ?? []) map.set(row.id, row.hero_image_url ?? null)
  return map
}

function truncate(s: string | null, n = 60): string {
  if (!s) return '(none)'
  return s.length > n ? s.slice(0, n) + '…' : s
}

async function main() {
  const { grouped, unmatched } = scanFiles()

  console.log(`Matched ${grouped.length} treatments to files (of 67 total).\n`)

  if (unmatched.length > 0) {
    console.log('⚠ Files that did NOT match a treatment position:')
    for (const f of unmatched) console.log(`  - ${f}`)
    console.log()
  }

  const heroMap = await currentHeroUrls(grouped.map((g) => g.id))

  console.log('# | slug | files | current hero_image_url | new hero_image_url (predicted)')
  console.log('-'.repeat(120))
  for (const g of grouped) {
    const isPaired = g.files.length === 2
    const predictedHero = `${url}/storage/v1/object/public/${BUCKET}/${g.id}/hero.jpg`
    const fileList = g.files.map((f) => f.fileName).join(', ')
    console.log(
      `${g.position} | ${g.slug} | ${fileList} | ${truncate(heroMap.get(g.id) ?? null)} | ${predictedHero}${isPaired ? ' (+ gallery 2nd image)' : ''}`,
    )
  }

  if (!APPLY) {
    console.log('\nDRY RUN — nothing was written. Re-run with --apply to upload and update the DB.')
    printSizeReport(grouped)
    return
  }

  console.log('\nApplying...\n')
  await ensureBucket()
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'therapy-photos-'))
  let ok = 0
  let fail = 0

  for (const g of grouped) {
    try {
      const hero = g.files[0]
      const heroProcessed = processImage(hero.filePath, tmpDir, `${g.slug}-hero.jpg`)
      const heroUrl = await uploadOne(g.id, 'hero.jpg', heroProcessed)

      if (g.files.length === 2) {
        const alt = g.files[1]
        const altProcessed = processImage(alt.filePath, tmpDir, `${g.slug}-gallery-2.jpg`)
        const altUrl = await uploadOne(g.id, 'gallery-2.jpg', altProcessed)
        const gallery = [
          { url: heroUrl, alt: g.title },
          { url: altUrl, alt: `${g.title} (alternate view)` },
        ]
        const { data, error } = await sb
          .from('treatments')
          .update({ hero_image_url: heroUrl, gallery })
          .eq('id', g.id)
          .select('id')
        if (error) throw error
        if (!data || data.length !== 1) throw new Error(`expected 1 row updated by id, got ${data?.length ?? 0}`)
        console.log(`  ✓ #${g.position} ${g.title} → hero_image_url + gallery (paired)`)
      } else {
        const { data, error } = await sb
          .from('treatments')
          .update({ hero_image_url: heroUrl })
          .eq('id', g.id)
          .select('id')
        if (error) throw error
        if (!data || data.length !== 1) throw new Error(`expected 1 row updated by id, got ${data?.length ?? 0}`)
        console.log(`  ✓ #${g.position} ${g.title} → hero_image_url`)
      }
      ok++
    } catch (err) {
      console.error(`  ✗ #${g.position} ${g.title}:`, (err as Error).message)
      fail++
    }
  }

  console.log(`\nDone — ${ok} treatments updated, ${fail} failed`)
  printSizeReport(grouped)
}

function printSizeReport(grouped: Grouped[]) {
  console.log('\nSource photos smaller than 2000px wide or portrait orientation:')
  let any = false
  for (const g of grouped) {
    for (const f of g.files) {
      const { w, h } = imageDims(f.filePath)
      const issues: string[] = []
      if (w < 2000) issues.push(`${w}px wide (<2000)`)
      if (h > w) issues.push('portrait')
      if (issues.length > 0) {
        any = true
        console.log(`  #${g.position} ${g.title} — ${f.fileName}: ${w}x${h} — ${issues.join(', ')}`)
      }
    }
  }
  if (!any) console.log('  (none)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
