import { statusLabel } from '@/lib/support/format'
import type { TicketStatus } from '@/lib/support/format'

interface TicketStatusPillProps {
  status: TicketStatus
}

const STYLES: Record<TicketStatus, { bg: string; text: string }> = {
  open: {
    bg: 'bg-[#2F5D50]/10',
    text: 'text-[#2F5D50]',
  },
  'awaiting-customer': {
    bg: 'bg-[#D4A373]/15',
    text: 'text-[#9c6f3e]',
  },
  resolved: {
    bg: 'bg-[#1e3d32]/[0.08]',
    text: 'text-[#1e3d32]/65',
  },
  closed: {
    bg: 'bg-[#1e3d32]/[0.06]',
    text: 'text-[#2B2B2B]/50',
  },
}

export default function TicketStatusPill({ status }: TicketStatusPillProps) {
  const s = STYLES[status] ?? STYLES.open
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] ${s.bg} ${s.text}`}
    >
      {statusLabel(status)}
    </span>
  )
}
