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
  { code: 'BN08', name: 'Bintu', gender: 'male' },
  { code: 'SM05', name: 'Sreeja Mol', gender: 'female' },
  { code: 'CR08', name: 'Seeta', gender: 'female' },
  { code: 'AS12', name: 'Asha', gender: 'female' },
]

/**
 * Not a massage therapist — a synthetic code so the Vaidya's consultation
 * slots can be blocked (e.g. a personal day off) independently of a
 * whole-centre closure, reusing the same schedule_blocks mechanism. Never
 * appears in THERAPISTS / therapistsForGender — the Vaidya has no gender
 * matching role.
 */
export const VAIDYA_BLOCK_CODE = 'VAIDYA'

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

export interface Vaidya {
  code: string
  name: string
}

/** Vaidya roster. Add a second entry here when the second Vaidya is named. */
export const VAIDYAS: Vaidya[] = [
  { code: VAIDYA_BLOCK_CODE, name: 'Vaidya Akhil' },
]

export function vaidyaByCode(code: string | null | undefined): Vaidya | undefined {
  if (!code) return undefined
  return VAIDYAS.find((v) => v.code === code)
}

export function vaidyaName(code: string | null | undefined): string {
  return vaidyaByCode(code)?.name ?? code ?? ''
}

export function vaidyaLabel(v: Pick<Vaidya, 'code' | 'name'>): string {
  return `${v.name} · ${v.code}`
}
