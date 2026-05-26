import type { PortableTextBlock } from '@portabletext/types'

export interface SanityImageRef {
  _type?: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  alt?: string
}

export interface ProcedureStep {
  title: string
  description: string
}

export interface TreatmentCategory {
  _id: string
  title: string
  /** Optional because the legacy TREATMENT_CATEGORIES_QUERY (booking flow) doesn't project this. New queries always do. */
  slug?: string
  description?: string | null
  image?: SanityImageRef | null
  order: number | null
  treatmentCount?: number
}

export interface TreatmentSummary {
  _id: string
  title: string
  slug: string
  duration: string | null
  description: string | null
  heroImage: SanityImageRef | null
  requiresConsultation: boolean
  order: number | null
}

export interface TreatmentDetail {
  _id: string
  title: string
  slug: string
  duration: string | null
  description: string | null
  body: PortableTextBlock[] | null
  benefits: string[] | null
  procedureSteps: ProcedureStep[] | null
  sessionsRecommended: string | null
  contraindications: string | null
  origin: string | null
  sanskritName: string | null
  requiresConsultation: boolean
  heroImage: SanityImageRef | null
  gallery: SanityImageRef[] | null
  order: number | null
  category: {
    _id: string
    title: string
    slug: string
    order: number | null
  }
}

export interface TreatmentSibling {
  _id: string
  title: string
  slug: string
  categorySlug: string
  order: number | null
  duration: string | null
  heroImage: SanityImageRef | null
}

/**
 * Back-compat for the existing TREATMENTS_QUERY shape consumed by
 * the legacy TreatmentsMenu. Once Task 31 deletes the menu, this
 * type and the legacy query can be removed.
 */
export interface Treatment {
  _id: string
  title: string
  duration: string | null
  description: string | null
  requiresConsultation: boolean
  categoryId: string
  categoryTitle: string
  categoryOrder: number | null
}
