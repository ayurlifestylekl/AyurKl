import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

/**
 * Inviting empty state — used inside list cards when a customer has no
 * orders / no appointments yet. Should feel like an invitation, never
 * apologetic.
 */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-5 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6E1023]/[0.06]">
        <Icon className="h-4 w-4 text-[#6E1023]" strokeWidth={1.6} />
      </span>
      <h3 className="mt-2.5 font-heading text-[13px] font-semibold text-[#6E1023]">
        {title}
      </h3>
      <p
        className="mt-0.5 max-w-xs font-body text-[11.5px] text-[#1F1F1F]/55"
        style={{ lineHeight: 1.55 }}
      >
        {body}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="group mt-3 inline-flex items-center gap-1.5 font-heading text-[11.5px] font-semibold text-[#D4AF37] underline-offset-4 transition-colors hover:text-[#D4AF37] hover:underline"
        >
          {ctaLabel}
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
      {secondaryCtaLabel && secondaryCtaHref && (
        <Link
          href={secondaryCtaHref}
          className="group mt-2 inline-flex items-center gap-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E1023]/55 underline-offset-4 transition-colors hover:text-[#D4AF37] hover:underline"
        >
          {secondaryCtaLabel}
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
