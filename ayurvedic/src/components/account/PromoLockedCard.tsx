import { Lock, type LucideIcon } from 'lucide-react'

interface PromoLockedCardProps {
  title: string
  description: string
  icon: LucideIcon
}

export default function PromoLockedCard({
  title,
  description,
  icon: Icon,
}: PromoLockedCardProps) {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#163F33]/6 bg-[#F7F2E8]/30 p-5 opacity-80"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
      }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
          <Icon className="h-4 w-4 text-[#163F33]/45" strokeWidth={1.8} />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/[0.08] px-2 py-0.5 font-heading text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">
          <Lock className="h-2.5 w-2.5" strokeWidth={2.2} />
          Coming soon
        </span>
      </div>
      <div className="mt-4 flex-1">
        <h3
          className="font-heading text-[14px] font-bold text-[#163F33]/85"
          style={{ letterSpacing: '-0.005em' }}
        >
          {title}
        </h3>
        <p
          className="mt-1 font-body text-[12px] text-[#1F1F1F]/60"
          style={{ lineHeight: 1.55 }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
