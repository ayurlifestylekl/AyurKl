/**
 * Seeds the 5 client-supplied Ayurveda Wellness Centre products (Dandra Care
 * Oil, Balashwagandhaadi Tailam, Lakshadi Kera Tailam, Himasagara Tailam,
 * Nalpamaradi Body Lotion) into the real `products` table — the same table
 * the Product Management admin (/admin/products) and the storefront
 * (/products, /products/[slug], and the homepage "Best Sellers" section)
 * read from. Content below is transcribed from the client's product spec
 * PDFs (Downloads/ilovepdf_converted/1-5.pdf); their embedded label photos
 * are uploaded to the `product-images` Supabase Storage bucket.
 *
 * price_rm, sku and stock_qty are NOT in the source PDFs (they only contain
 * "[Insert Batch]" / "[Insert Date]" placeholders for manufacturing info) —
 * these are seeded as placeholders and every row is created with
 * status: 'draft' so nothing goes live with a fake price. Review each
 * product in Product Management → Catalog (/admin/products), set the real
 * price + SKU + stock, then flip status to Active to publish — that alone
 * makes it appear on /products, its own /products/[slug] page, and the
 * homepage Best Sellers section (featured is already set to true).
 *
 * Idempotent: upserts by slug, safe to re-run.
 * Run: npx tsx scripts/seed-bestsellers-products.ts
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}
const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

const BUCKET = 'product-images'
const IMG_DIR =
  '/private/tmp/claude-501/-Users-sanjaygunabalan2626gmail-com-Documents-Ayurvedic-/c029f1d5-f042-4eae-9c6a-f2f6c4293aa3/scratchpad/product-images/'

interface SeedProduct {
  slug: string
  name: string
  sku: string
  category: string
  short_description: string
  description: string
  ingredients: string
  dosage_instructions: string
  contraindications: string
  tags: string[]
  imageFile: string
}

const PRODUCTS: SeedProduct[] = [
  {
    slug: 'dandra-care-oil',
    name: 'Dandra Care Oil',
    sku: 'AWC-DANDRA-200',
    category: 'hair-care',
    short_description: 'Soothes itchy, flake-prone scalp and supports healthy hair',
    description:
      'Dandra Care Oil by Ayurveda Wellness Centre is a modified, Ayurvedic topical formulation designed to support scalp hygiene and promote overall hair wellness naturally. Prepared using traditional Ayurvedic herbs and medicated oil bases, this formulation is valued for helping maintain a balanced scalp environment, supporting scalp comfort, and encouraging healthy hair care practices. This formulation helps support the scalp in managing Darunaka (dandruff), scalp discomfort, and visible flakes associated with environmental and lifestyle factors, while balancing aggravated Vata and Kapha doshas in the scalp. Net volume 200ml.',
    ingredients:
      'Keratailam / Tila Taila (sesame oil base), Coconut Oil, Karanja (Pongamia pinnata), Datura Leaf (Thorn Apple) extract, Bermuda Grass (Durva), Indian Coral Tree (Paribhadra), Nimba (Neem)',
    dosage_instructions:
      'Apply an adequate quantity over the scalp. Gently massage with fingertips in circular motion for 5–10 minutes to improve local blood circulation. Leave on the scalp for 30–45 minutes, then rinse thoroughly with a mild herbal hair wash powder or sulfate-free herbal shampoo and lukewarm water. Use 2–3 times a week, or as directed by an Ayurveda vaidya.',
    contraindications:
      'For external application only. For age above 10 years only. Do not ingest — contains processed Datura metel (Thorn Apple) leaf; keep strictly out of reach of children. Avoid contact with eyes; rinse immediately with cold water if contact occurs. Use under medical supervision if you have severe sensitive skin. Pure coconut oil-based formulations may solidify below 24°C — immerse the bottle in warm water to liquefy if needed.',
    tags: ['anti-dandruff', 'scalp-care', 'hair-oil'],
    imageFile: '1-000.jpg',
  },
  {
    slug: 'balashwagandhaadi-tailam',
    name: 'Balashwagandhaadi Tailam',
    sku: 'AWC-BALASHWA-200',
    category: 'pain-relief',
    short_description: 'Muscle strengthening & joint pain relief oil for recovery',
    description:
      'Formulated according to the traditional text Yogaratnakaram, Balashwagandhaadi Tailam is an authentic Ayurvedic body oil crafted to restore physical strength, support neural health, and ease joint discomfort. It harmonises Vata and Pitta doshas, making it an ideal remedy for physical exhaustion, post-illness rehabilitation, and general vitality. Ideal for post-illness, post-injury or postpartum recovery, athletes and fitness enthusiasts, elderly individuals seeking joint and muscle support, and anyone experiencing persistent tiredness, stress or sleep disruption. Note: prepared using classical methods incorporating curd (dairy) — not suitable for vegans. Net volume 200ml.',
    ingredients:
      'Taila / Sesamum indicum oil (base), Mastu (curd whey — liquid medium), Bala (Sida cordifolia), Ashwagandha (Withania somnifera), Laksha (Laccifer lacca), plus fine herbal paste extracts',
    dosage_instructions:
      'Warm the oil slightly. Apply to the body or affected area and massage gently. Leave on for 30–45 minutes before a warm bath. For age above 6 years. If the oil thickens or solidifies in colder temperatures, warm the container gently in warm water (98–105°F) before use.',
    contraindications:
      'For external use only. Do not apply to broken skin. Avoid during acute fever. Contains dairy (curd) — not suitable for vegans.',
    tags: ['muscle-recovery', 'joint-pain', 'massage-oil'],
    imageFile: '2-000.jpg',
  },
  {
    slug: 'lakshadi-kera-tailam',
    name: 'Lakshadi Kera Tailam',
    sku: 'AWC-LAKSHADI-200',
    category: 'skin-care',
    short_description: "Kerala's trusted traditional baby & kids massage oil — nourishes skin, strengthens bones & muscles",
    description:
      'Rooted in the ancient text Ashtanga Hridaya, Lakshadi Kera Tailam is a time-honoured herbal massage oil crafted for growing babies and adults alike. Traditionally used in body massage (Abhyanga) for children to promote healthy growth and immunity, it deeply moisturises and hydrates dry skin, improves skin texture, and soothes mild irritation, while supporting muscle health, tissue recovery and physical vitality (Balya). It also pacifies aggravated Pitta and Vata doshas. Safe for infants from the second month, and equally used by adults for full-body hydration, stress relief and youthful skin suppleness. Net volume 200ml.',
    ingredients:
      'Kera Taila / Coconut Oil (Cocos nucifera — base), Laksha (Laccifer lacca), Ashwagandha (Withania somnifera), Nisa / Haridra (Curcuma longa — turmeric), Devadaru (Cedrus deodara)',
    dosage_instructions:
      'Apply a required quantity over the head (Moordhataila) or body (Abhyanga). Massage gently in circular motions. Leave on for 15–30 minutes before washing off with lukewarm water and a mild cleanser. Dosage as directed by an Ayurvedic practitioner.',
    contraindications:
      'For external use only. Do not ingest. Avoid contact with eyes or open wounds/cut skin. Perform a patch test before first use; avoid application on open wounds, broken skin or active fungal infections. Wash soles/feet thoroughly after application to prevent slipping.',
    tags: ['baby-massage-oil', 'kids-care', 'skin-nourishing'],
    imageFile: '3-000.jpg',
  },
  {
    slug: 'himasagara-tailam',
    name: 'Himasagara Tailam',
    sku: 'AWC-HIMASAGARA-200',
    category: 'stress-relief',
    short_description: 'Classical Ayurvedic oil for strength, restful sleep and joint comfort (used for Sirodhaara)',
    description:
      'Himasagara Tailam is a medicated oil described in the classical text Bhaishajya Ratnavali, explained in the context of Vatavyadhi. Mostly prescribed during convalescence, massage with this oil helps regain strength and vitality and is used in general weakness and debility. Applied over the head it supports good sleep and helps reduce stress; regular use helps bring down excess body heat and reduce burning sensation of the skin. It is one of the Ayurvedic oils used for Sirodhaara to improve sleep, and also supports recovery from bone and joint injuries, frozen joints, muscle wasting and locomotor impairments from trauma or over-exertion. Balances Vata and Pitta doshas.',
    ingredients:
      'Tila Taila / Sesame Oil, Narikela Ksheera (coconut milk), Go-Ksheera (cow\'s milk), Shatavari (Asparagus racemosus), Chandana (Santalum album), Jatamansi (Nardostachys jatamansi), Madhuka (Glycyrrhiza glabra), Amalaki (Emblica officinalis), Gokshura (Tribulus terrestris)',
    dosage_instructions:
      'For body: apply a sufficient quantity over the affected area or full body for Abhyanga (massage) with gentle strokes for 10 minutes; leave on for 15–30 minutes before washing off with lukewarm water. For scalp: gentle massage for 10–15 minutes for stress and sleep support.',
    contraindications:
      'For external use only. Do not ingest. Avoid contact with eyes or open wounds/cut skin. Wash feet thoroughly after application to prevent slipping. Avoid use during fever, cold, chronic inflammatory conditions or any infection.',
    tags: ['sleep-support', 'stress-relief', 'sirodhaara', 'joint-stiffness'],
    imageFile: '4-000.jpg',
  },
  {
    slug: 'nalpamaradi-body-lotion',
    name: 'AWC Nalpamaradi Body Lotion',
    sku: 'AWC-NALPAMARADI-100',
    category: 'skin-care',
    short_description: 'Deep hydration & daily nourishment — 100% natural, non-greasy, fast-absorbing herbal body lotion',
    description:
      'Nalpamaradi Body Lotion is a solution for dry, rough, scaly and itchy skin. Infused with Nalpamaradi Thailam and rich herbs, it penetrates deeply to replenish lost moisture and ease tightness, while forming a lightweight protective barrier that locks in hydration and keeps daily flakiness away. It calms persistent discomfort and itching, refines uneven or scaly texture, and its nutrient-dense blend of sesame oil, turmeric and botanicals supports long-term radiance and skin resilience. Combines the richness of Ayurvedic tradition with selected ingredients for gentle, effective daily skincare. Net volume 100ml.',
    ingredients:
      'Nalpamaradi Thailam (base brightening oil), Turmeric (Haridra), Vetiver (Usira), Aloe Vera, Cocoa Butter, Shea Butter, Vitamin E, Sesame Oil',
    dosage_instructions:
      'After showering or bathing, towel dry gently. Dispense a generous amount into your palm and apply all over the body, focusing on areas prone to dryness, roughness or itchiness. Massage in using circular motions until fully absorbed. Use daily, especially after bathing, for best results.',
    contraindications:
      'Perform a patch test before use — apply a small amount to a discreet area (inner arm or behind the ear) and observe for 24–48 hours for redness, swelling or itching. Results for tan/pigmentation are gradual. People with very oily or acne-prone skin should patch test first.',
    tags: ['body-lotion', 'daily-hydration', 'skin-brightening'],
    imageFile: '5-006.jpg',
  },
]

function contentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'jpeg' || ext === 'jpg') return 'image/jpeg'
  return 'application/octet-stream'
}

async function uploadImage(slug: string, filename: string): Promise<string> {
  const path = `${IMG_DIR}${filename}`
  if (!existsSync(path)) throw new Error(`file missing: ${path}`)
  const buffer = readFileSync(path)
  const storagePath = `${slug}/${filename}`
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: contentType(filename), upsert: true })
  if (error) throw error
  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function main() {
  let ok = 0
  let fail = 0

  for (const p of PRODUCTS) {
    try {
      const imageUrl = await uploadImage(p.slug, p.imageFile)

      const { data: existing } = await sb
        .from('products')
        .select('id')
        .eq('slug', p.slug)
        .maybeSingle()

      const row = {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        category: p.category,
        short_description: p.short_description,
        description: p.description,
        ingredients: p.ingredients,
        dosage_instructions: p.dosage_instructions,
        contraindications: p.contraindications,
        tags: p.tags,
        image_url: imageUrl,
        // Not in the source spec PDFs — placeholders. Kept in draft so
        // nothing publishes with a fake price; set the real price/SKU/
        // stock in Product Management, then flip status to "active".
        price_rm: 0,
        stock_qty: 0,
        is_bundle: false,
        status: 'draft' as const,
        featured: true,
      }

      if (existing) {
        const { error } = await sb.from('products').update(row).eq('id', existing.id)
        if (error) throw error
        console.log(`  ↻ updated ${p.name}`)
      } else {
        const { error } = await sb.from('products').insert(row)
        if (error) throw error
        console.log(`  ✓ created ${p.name}`)
      }
      ok++
    } catch (err) {
      console.error(`  ✗ ${p.name}:`, (err as Error).message)
      fail++
    }
  }

  console.log(`\nDone — ${ok} products seeded, ${fail} failed.`)
  console.log('All rows are status: "draft" with price_rm/stock_qty placeholders.')
  console.log('Review + finalise them in Product Management → Catalog (/admin/products), then set status to "active" to publish.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
