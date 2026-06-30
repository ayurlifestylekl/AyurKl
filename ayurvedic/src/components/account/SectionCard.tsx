import type { LucideIcon } from 'lucide-react'

interface SectionCardProps {
  icon: LucideIcon
  title: string
  /** Optional small caption under the title. */
  subtitle?: string
  /** Optional chip rendered on the header's right side (e.g. "PDPA"). */
  badge?: React.ReactNode
  children: React.ReactNode
  /** Visual emphasis — use for the health intake section. */
  tone?: 'default' | 'sensitive'
}

export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
  tone = 'default',
}: SectionCardProps) {
  const isSensitive = tone === 'sensitive'

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border bg-white ${
        isSensitive ? 'border-[#D4AF37]/25' : 'border-[#6E1023]/8'
      }`}
      style={{
        boxShadow:
          '0 1px 0 0 rgba(110,16,35,0.04), 0 12px 30px -16px rgba(110,16,35,0.18)',
      }}
    >
      {isSensitive && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[#D4AF37]" />
      )}
      <header
        className={`flex items-start justify-between gap-3 border-b px-5 py-4 sm:px-6 ${
          isSensitive ? 'border-[#D4AF37]/15' : 'border-[#6E1023]/6'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isSensitive ? 'bg-[#D4AF37]/15' : 'bg-[#6E1023]/[0.06]'
            }`}
          >
            <Icon
              className={`h-4 w-4 ${isSensitive ? 'text-[#D4AF37]' : 'text-[#6E1023]'}`}
              strokeWidth={1.8}
            />
          </span>
          <div>
            <h2
              className="font-heading text-[14px] font-bold text-[#6E1023]"
              style={{ letterSpacing: '-0.005em' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="mt-0.5 font-body text-[11.5px] text-[#1F1F1F]/55"
                style={{ lineHeight: 1.55 }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </header>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  )
}
