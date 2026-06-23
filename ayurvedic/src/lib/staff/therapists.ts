import type { Gender } from '@/types/booking'

export interface Therapist {
  code: string
  name: string
  gender: Gender
  active?: boolean
}

/**
 * Therapist roster. Edit here to add/remove therapists or change codes.
 * Genders drive the same-gender matching — keep them accurate.
 * Genders confirmed by the clinic (2026-06-23).
 */
export const THERAPISTS: Therapist[] = [
  { code: 'NT02', name: 'Nithin', gender: 'male' },
  { code: 'DP03', name: 'Deepak', gender: 'male' },
  { code: 'BN08', name: 'Bintu', gender: 'female' },
  { code: 'SM05', name: 'Sreeja Mol', gender: 'female' },
  { code: 'CR08', name: 'Seeta', gender: 'female' },
  { code: 'AS12', name: 'Asha', gender: 'female' },
]

export function therapistByCode(code: string | null | undefined): Therapist | undefined {
  if (!code) return undefined
  return THERAPISTS.find((t) => t.code === code)
}

/** Active therapists of a given gender (or all if no requirement). */
export function therapistsForGender(gender: Gender | null): Therapist[] {
  return THERAPISTS.filter((t) => t.active !== false && (!gender || t.gender === gender))
}

/** "Asha · AS12" display label. */
export function therapistLabel(t: Pick<Therapist, 'code' | 'name'>): string {
  return `${t.name} · ${t.code}`
}
