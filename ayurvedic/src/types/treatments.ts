/**
 * Shared types for the Treatments feature.
 *
 * These mirror the GROQ projections in `src/sanity/queries.ts` —
 * keep them in sync if you add fields to the Sanity schema.
 */

export interface TreatmentCategory {
  _id: string
  title: string
  order: number | null
}

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
