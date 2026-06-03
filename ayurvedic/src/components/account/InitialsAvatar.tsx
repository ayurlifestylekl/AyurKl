/**
 * Pure CSS initials avatar. Deterministic palette assignment by hashing
 * the user ID — same person always gets the same colour across surfaces.
 */

interface InitialsAvatarProps {
  /** Full name. First letter is used. */
  name: string | null | undefined
  /** User id — used to pick a stable palette tile. */
  seed?: string | null
  /** Visual size. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** If present, renders an image instead of the initials letter. */
  avatarUrl?: string | null
}

const PALETTES = [
  { bg: '#1E5B4B', fg: '#F7F2E8' }, // herbal green
  { bg: '#2E7D5A', fg: '#F7F2E8' }, // olive
  { bg: '#D4AF37', fg: '#1F1F1F' }, // turmeric gold
  { bg: '#163F33', fg: '#F7F2E8' }, // deep green
  { bg: '#9c6f3e', fg: '#F7F2E8' }, // warm amber
] as const

const SIZE_CLASSES: Record<NonNullable<InitialsAvatarProps['size']>, {
  box: string
  text: string
}> = {
  sm: { box: 'h-8 w-8', text: 'text-[13px]' },
  md: { box: 'h-12 w-12', text: 'text-[18px]' },
  lg: { box: 'h-16 w-16', text: 'text-[24px]' },
  xl: { box: 'h-24 w-24 sm:h-28 sm:w-28', text: 'text-[40px] sm:text-[48px]' },
}

function pickPalette(seed: string | null | undefined): (typeof PALETTES)[number] {
  if (!seed) return PALETTES[0]
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return PALETTES[h % PALETTES.length]
}

function firstInitial(name: string | null | undefined): string {
  if (!name) return '·'
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '·'
}

export default function InitialsAvatar({
  name,
  seed,
  size = 'md',
  avatarUrl,
}: InitialsAvatarProps) {
  const sizes = SIZE_CLASSES[size]

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? ''}
        className={`inline-block shrink-0 rounded-2xl object-cover ${sizes.box}`}
        style={{
          boxShadow: '0 1px 0 0 rgba(22, 63, 51,0.08), 0 12px 30px -16px rgba(22, 63, 51,0.35)',
        }}
      />
    )
  }

  const palette = pickPalette(seed ?? name ?? null)
  const letter = firstInitial(name)

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl font-heading font-bold ${sizes.box} ${sizes.text}`}
      style={{
        backgroundColor: palette.bg,
        color: palette.fg,
        letterSpacing: '-0.02em',
        boxShadow: '0 1px 0 0 rgba(22, 63, 51,0.08), 0 12px 30px -16px rgba(22, 63, 51,0.35)',
      }}
    >
      {letter}
    </span>
  )
}
