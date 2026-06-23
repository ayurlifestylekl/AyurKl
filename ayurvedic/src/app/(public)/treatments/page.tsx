import type { Metadata } from 'next'

import CategoryGrid from '@/components/treatments/CategoryGrid'
import FreeConsultationBlock from '@/components/treatments/FreeConsultationBlock'
import TreatmentsHero from '@/components/treatments/TreatmentsHero'
import { createClient } from '@/lib/supabase/server'
import { getTreatmentCategoriesIndex } from '@/lib/storefront/treatments'
import type { TreatmentCategory } from '@/types/treatments'

export const metadata: Metadata = {
  title: 'Treatments — Authentic Kerala Ayurveda Therapies',
  description:
    'Browse the full library of authentic Kerala Ayurveda therapies offered at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur — face care, massage, stress relief, joint care, rehabilitation, kids, and more. Free consultation with our Vaidyas.',
  alternates: { canonical: '/treatments' },
  openGraph: {
    title: 'Treatments — Kerala Ayurvedic Lifestyle',
    description:
      'Authentic Ayurveda therapies across the Centre catalogue. Personal protocols designed by a KKM-registered Kerala Vaidya in Brickfields, KL.',
    url: 'https://keralaayurvediclifestyle.com.my/treatments',
    type: 'website',
  },
}

// Reads auth cookies (Supabase server client) → must render on demand, not ISR.
export const dynamic = 'force-dynamic'

async function loadCategories(): Promise<TreatmentCategory[]> {
  try {
    const supabase = await createClient()
    return await getTreatmentCategoriesIndex(supabase)
  } catch (err) {
    console.error('[treatments] catalogue fetch failed:', err)
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
