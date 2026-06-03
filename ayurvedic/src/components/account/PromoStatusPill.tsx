import type { EffectiveStatus } from '@/lib/promos/format'

interface PromoStatusPillProps {
  status: EffectiveStatus
}

const STYLES: Record<EffectiveStatus, { bg: string; text: string; label: string }> = {
  active: {
    bg: 'bg-[#1E5B4B]/10',
    text: 'text-[#1E5B4B]',
    label: 'Active',
  },
  used: {
    bg: 'bg-[#163F33]/[0.08]',
    text: 'text-[#163F33]/65',
    label: 'Used',
  },
  expired: {
    bg: 'bg-[#163F33]/[0.06]',
    text: 'text-[#1F1F1F]/50',
    label: 'Expired',
  },
  revoked: {
    bg: 'bg-red-50',
    text: 'text-red-700/70',
    label: 'Revoked',
  },
}

export default function PromoStatusPill({ status }: PromoStatusPillProps) {
  const s = STYLES[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}
