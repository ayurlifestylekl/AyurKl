import { statusLabel } from '@/lib/support/format'
import type { TicketStatus } from '@/lib/support/format'

interface TicketStatusPillProps {
  status: TicketStatus
}

const STYLES: Record<TicketStatus, { bg: string; text: string }> = {
  open: {
    bg: 'bg-[#6E1023]/10',
    text: 'text-[#6E1023]',
  },
  'awaiting-customer': {
    bg: 'bg-[#D4AF37]/15',
    text: 'text-[#9c6f3e]',
  },
  resolved: {
    bg: 'bg-[#6E1023]/[0.08]',
    text: 'text-[#6E1023]/65',
  },
  closed: {
    bg: 'bg-[#6E1023]/[0.06]',
    text: 'text-[#1F1F1F]/50',
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
