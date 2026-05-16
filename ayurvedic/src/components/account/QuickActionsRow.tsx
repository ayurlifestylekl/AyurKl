import Link from 'next/link'
import {
  ShoppingBag,
  Calendar,
  RotateCw,
  MessageCircle,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

interface Action {
  label: string
  href: string
  icon: LucideIcon
  external?: boolean
}

const ACTIONS: Action[] = [
  { label: 'Shop wellness', href: '/products', icon: ShoppingBag },
  { label: 'Book a session', href: '/book/consultation', icon: Calendar },
  { label: 'Reorder', href: '/products', icon: RotateCw },
  {
    label: 'Message us',
    href: 'https://wa.me/601165043436?text=Hi%20Kerala%20Ayurvedic%2C%20I%27d%20like%20some%20help.',
    icon: MessageCircle,
    external: true,
  },
]

export default function QuickActionsRow() {
  return (
    <section>
      <h2 className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1e3d32]/55">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          const inner = (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D4A373]/12 transition-colors group-hover:bg-[#D4A373]/22">
                <Icon className="h-3.5 w-3.5 text-[#D4A373]" strokeWidth={1.8} />
              </span>
              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="font-heading text-[12px] font-semibold text-[#1e3d32] sm:text-[13px]">
                  {action.label}
                </span>
                <ArrowUpRight className="h-3 w-3 -translate-x-1 text-[#1e3d32]/30 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
              </span>
            </>
          )
          const className =
            'group flex items-center gap-2.5 rounded-2xl border border-[#1e3d32]/8 bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4A373]/35 sm:px-4'
          const style = {
            boxShadow:
              '0 1px 0 0 rgba(30,61,50,0.04), 0 8px 22px -14px rgba(30,61,50,0.18)',
          }
          return action.external ? (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              style={style}
            >
              {inner}
            </a>
          ) : (
            <Link key={action.label} href={action.href} className={className} style={style}>
              {inner}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
