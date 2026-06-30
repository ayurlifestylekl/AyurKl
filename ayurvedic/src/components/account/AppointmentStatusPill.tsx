import type { AppointmentBucket } from '@/lib/appointments/policy'

interface AppointmentStatusPillProps {
  bucket: AppointmentBucket
}

const STYLES: Record<AppointmentBucket, { bg: string; text: string; label: string }> = {
  today: {
    bg: 'bg-[#D4AF37]/15',
    text: 'text-[#9c6f3e]',
    label: 'Today',
  },
  upcoming: {
    bg: 'bg-[#6E1023]/10',
    text: 'text-[#6E1023]',
    label: 'Upcoming',
  },
  past: {
    bg: 'bg-[#6E1023]/[0.08]',
    text: 'text-[#6E1023]/65',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700/75',
    label: 'Cancelled',
  },
}

export default function AppointmentStatusPill({ bucket }: AppointmentStatusPillProps) {
  const s = STYLES[bucket]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}
