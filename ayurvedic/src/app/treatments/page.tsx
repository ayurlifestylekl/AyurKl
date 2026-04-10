import type { Metadata } from 'next'

import TreatmentsMenu from '@/components/treatments/TreatmentsMenu'
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import { TREATMENTS_QUERY, TREATMENT_CATEGORIES_QUERY } from '@/sanity/queries'
import type { Treatment, TreatmentCategory } from '@/types/treatments'

export const metadata: Metadata = {
  title: 'Treatments — Authentic Kerala Ayurveda Therapies',
  description:
    'Browse the full library of authentic Kerala Ayurveda therapies offered at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur — face care, massage, stress relief, joint care, rehabilitation, kids, and more. Free consultation with Vaidya AKHIL HS (B.A.M.S).',
  alternates: { canonical: '/treatments' },
  openGraph: {
    title: 'Treatments — Kerala Ayurvedic Lifestyle',
    description:
      'Sixty-plus authentic Ayurveda therapies across 12 categories. Personal protocols designed by a KKM-registered Kerala Vaidya in Brickfields, KL.',
    url: 'https://keralaayurvedic.com/treatments',
    type: 'website',
  },
}

// Re-render every hour to pick up CMS edits without a redeploy.
export const revalidate = 3600

async function loadFromSanity(): Promise<{
  categories: TreatmentCategory[]
  treatments: Treatment[]
}> {
  if (!isSanityConfigured) {
    // Sanity hasn't been wired up yet. Render an empty grid + the Free
    // Consultation banner so the route still ships.
    return { categories: [], treatments: [] }
  }

  try {
    const [categories, treatments] = await Promise.all([
      sanityClient.fetch<TreatmentCategory[]>(TREATMENT_CATEGORIES_QUERY),
      sanityClient.fetch<Treatment[]>(TREATMENTS_QUERY),
    ])
    return { categories: categories ?? [], treatments: treatments ?? [] }
  } catch (err) {
    console.error('[treatments] Sanity fetch failed:', err)
    return { categories: [], treatments: [] }
  }
}

export default async function TreatmentsPage() {
  const { categories, treatments } = await loadFromSanity()
  return <TreatmentsMenu categories={categories} treatments={treatments} />
}
