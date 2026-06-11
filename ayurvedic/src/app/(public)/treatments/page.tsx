import type { Metadata } from 'next'

import CategoryGrid from '@/components/treatments/CategoryGrid'
import FreeConsultationBlock from '@/components/treatments/FreeConsultationBlock'
import TreatmentsHero from '@/components/treatments/TreatmentsHero'
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import { TREATMENT_CATEGORIES_INDEX_QUERY } from '@/sanity/queries'
import type { TreatmentCategory } from '@/types/treatments'

export const metadata: Metadata = {
  title: 'Treatments — Authentic Kerala Ayurveda Therapies',
  description:
    'Browse the full library of authentic Kerala Ayurveda therapies offered at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur — face care, massage, stress relief, joint care, rehabilitation, kids, and more. Free consultation with Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu).',
  alternates: { canonical: '/treatments' },
  openGraph: {
    title: 'Treatments — Kerala Ayurvedic Lifestyle',
    description:
      'Authentic Ayurveda therapies across the Centre catalogue. Personal protocols designed by a KKM-registered Kerala Vaidya in Brickfields, KL.',
    url: 'https://keralaayurvedic.com/treatments',
    type: 'website',
  },
}

export const revalidate = 30

async function loadCategories(): Promise<TreatmentCategory[]> {
  if (!isSanityConfigured) return []
  try {
    const categories = await sanityClient.fetch<TreatmentCategory[]>(
      TREATMENT_CATEGORIES_INDEX_QUERY,
    )
    return categories ?? []
  } catch (err) {
    console.error('[treatments] Sanity fetch failed:', err)
    return []
  }
}

export default async function TreatmentsPage() {
  const categories = await loadCategories()
  const therapyCount = categories.reduce(
    (sum, c) => sum + (c.treatmentCount ?? 0),
    0,
  )
  return (
    <>
      <TreatmentsHero
        therapyCount={therapyCount || undefined}
        onBrowseTreatments={undefined}
      />
      <CategoryGrid categories={categories} />
      <FreeConsultationBlock />
    </>
  )
}
