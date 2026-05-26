import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CategoryPageHeader from '@/components/treatments/CategoryPageHeader'
import FreeConsultationBlock from '@/components/treatments/FreeConsultationBlock'
import TherapyGrid from '@/components/treatments/TherapyGrid'
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import { CATEGORY_BY_SLUG_QUERY, CATEGORY_SLUGS_QUERY } from '@/sanity/queries'
import type { TreatmentCategory, TreatmentSummary } from '@/types/treatments'

export const revalidate = 30
export const dynamicParams = true

interface CategoryPageData extends TreatmentCategory {
  treatments: TreatmentSummary[]
}

async function loadCategory(slug: string): Promise<CategoryPageData | null> {
  if (!isSanityConfigured) return null
  try {
    return await sanityClient.fetch<CategoryPageData | null>(
      CATEGORY_BY_SLUG_QUERY,
      { slug },
    )
  } catch (err) {
    console.error(`[treatments/${slug}] Sanity fetch failed:`, err)
    return null
  }
}

export async function generateStaticParams(): Promise<Array<{ categorySlug: string }>> {
  if (!isSanityConfigured) return []
  try {
    const slugs = await sanityClient.fetch<string[]>(CATEGORY_SLUGS_QUERY)
    return (slugs ?? []).map((slug) => ({ categorySlug: slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string }
}): Promise<Metadata> {
  const category = await loadCategory(params.categorySlug)
  if (!category) {
    return {
      title: 'Category not found',
      robots: { index: false, follow: true },
    }
  }
  return {
    title: `${category.title} — Kerala Ayurvedic Lifestyle`,
    description: category.description ?? undefined,
    alternates: { canonical: `/treatments/${category.slug}` },
    openGraph: {
      title: `${category.title} — Kerala Ayurvedic Lifestyle`,
      description: category.description ?? undefined,
      type: 'website',
      url: `https://keralaayurvedic.com/treatments/${category.slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { categorySlug: string }
}) {
  const category = await loadCategory(params.categorySlug)
  if (!category) notFound()

  return (
    <>
      <section className="relative overflow-hidden bg-cream pb-12">
        <CategoryPageHeader
          title={category.title}
          description={category.description}
          order={category.order}
          treatmentCount={category.treatments.length}
        />
        <TherapyGrid
          categorySlug={category.slug}
          treatments={category.treatments}
        />
      </section>
      <FreeConsultationBlock />
    </>
  )
}
