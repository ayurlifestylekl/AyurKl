import type { LucideIcon } from 'lucide-react'

interface StatTileProps {
  /** Small caps label like "Active orders" */
  label: string
  /** Main value — "2", "RM 480", "Mar 15", etc. */
  value: string
  /** Sub-line beneath the value, e.g. "RM 480 total", "Panchakarma · 4 pm" */
  sub?: string
  /** Top-right icon */
  icon: LucideIcon
  /** Subtle accent color for the icon background */
  accent?: 'gold' | 'olive' | 'sage'
}

const ACCENT_BG: Record<NonNullable<StatTileProps['accent']>, string> = {
  gold: 'bg-[#D4A373]/15',
  olive: 'bg-[#7A9D54]/15',
  sage: 'bg-[#2F5D50]/10',
}
const ACCENT_TEXT: Record<NonNullable<StatTileProps['accent']>, string> = {
  gold: 'text-[#D4A373]',
  olive: 'text-[#7A9D54]',
  sage: 'text-[#2F5D50]',
}

export default function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'sage',
}: StatTileProps) {
  return (
    <article
      className="relative overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white p-4 sm:p-5"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1e3d32]/55">
          {label}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${ACCENT_BG[accent]}`}
        >
          <Icon className={`h-3.5 w-3.5 ${ACCENT_TEXT[accent]}`} strokeWidth={1.8} />
        </span>
      </div>

      <p
        className="mt-2.5 font-heading text-[22px] font-bold leading-none text-[#1e3d32] sm:text-[26px]"
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </p>

      {sub && (
        <p
          className="mt-1 font-body text-[11.5px] text-[#2B2B2B]/55"
          style={{ lineHeight: 1.5 }}
        >
          {sub}
        </p>
      )}
    </article>
  )
}
