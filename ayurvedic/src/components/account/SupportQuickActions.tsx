import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import {
  CLINIC_EMAIL,
  CLINIC_MAPS_URL,
  CLINIC_PHONE_PRIMARY,
  mailtoLink,
  telLink,
  whatsappLink,
} from '@/lib/clinic'

interface SupportQuickActionsProps {
  /** Optional context line that's prefilled into the WhatsApp deep link. */
  whatsappPrefill?: string
}

interface ActionTileProps {
  href: string
  icon: LucideIcon
  label: string
  detail: string
  external?: boolean
  primary?: boolean
}

function ActionTile({ href, icon: Icon, label, detail, external, primary }: ActionTileProps) {
  const className = primary
    ? 'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#D4A373]/30 bg-[#FAF6EE]/55 p-4 transition-all hover:-translate-y-0.5 hover:border-[#D4A373]/60 sm:p-5'
    : 'group flex h-full flex-col overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#D4A373]/35 sm:p-5'

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={className}
      style={{
        boxShadow: primary
          ? '0 1px 0 0 rgba(30,61,50,0.04), 0 18px 36px -22px rgba(212,163,115,0.4)'
          : '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -18px rgba(30,61,50,0.18)',
      }}
    >
      {primary && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[#D4A373]" />
      )}
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            primary ? 'bg-[#D4A373]/15' : 'bg-[#1e3d32]/[0.06]'
          }`}
        >
          <Icon
            className={`h-4 w-4 ${primary ? 'text-[#D4A373]' : 'text-[#2F5D50]'}`}
            strokeWidth={1.8}
          />
        </span>
        {external && (
          <ExternalLink
            className="h-3 w-3 text-[#1e3d32]/35 transition-colors group-hover:text-[#D4A373]"
            strokeWidth={2}
          />
        )}
      </div>
      <div className="mt-4 flex-1">
        <p className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1e3d32]/55">
          {label}
        </p>
        <p
          className="mt-1 font-heading text-[13.5px] font-semibold text-[#1e3d32]"
          style={{ letterSpacing: '-0.005em' }}
        >
          {detail}
        </p>
      </div>
    </a>
  )
}

export default function SupportQuickActions({ whatsappPrefill }: SupportQuickActionsProps) {
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
        <ActionTile
          primary
          external
          icon={MessageCircle}
          href={whatsappLink(
            whatsappPrefill ?? 'Hi Kerala Ayurvedic Lifestyle, I have a question.'
          )}
          label="Urgent"
          detail="WhatsApp Vaidya"
        />
        <ActionTile
          icon={Phone}
          href={telLink(CLINIC_PHONE_PRIMARY)}
          label="Call"
          detail={CLINIC_PHONE_PRIMARY}
        />
        <ActionTile
          icon={Mail}
          href={mailtoLink('Question for Kerala Ayurvedic Lifestyle')}
          label="Email"
          detail={CLINIC_EMAIL}
        />
        <ActionTile
          external
          icon={MapPin}
          href={CLINIC_MAPS_URL}
          label="Visit"
          detail="Brickfields, KL"
        />
      </div>
    </section>
  )
}
