import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'
import {
  CLINIC_ADDRESS,
  CLINIC_EMAIL,
  CLINIC_HOURS,
  CLINIC_LONG_NAME,
  CLINIC_MAPS_URL,
  CLINIC_PHONE_ALT_1,
  CLINIC_PHONE_PRIMARY,
  mailtoLink,
  telLink,
} from '@/lib/clinic'

export default function ClinicInfoCard() {
  return (
    <section
      className="overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-[#163F33]/6 px-5 py-3 sm:px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#163F33]/[0.06]">
          <MapPin className="h-3.5 w-3.5 text-[#1E5B4B]" strokeWidth={1.8} />
        </span>
        <h2 className="font-heading text-[13px] font-semibold text-[#163F33]">
          The Vaidyasalai
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-3 sm:px-6">
        {/* Address */}
        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55">
            Visit us
          </p>
          <p
            className="mt-2 font-heading text-[13px] font-bold text-[#163F33]"
            style={{ letterSpacing: '-0.005em' }}
          >
            {CLINIC_LONG_NAME}
          </p>
          <p className="mt-1 font-body text-[12px] text-[#1F1F1F]/65" style={{ lineHeight: 1.55 }}>
            {CLINIC_ADDRESS}
          </p>
          <a
            href={CLINIC_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37] transition-colors hover:text-[#D4AF37]"
          >
            Open in Maps
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </a>
        </div>

        {/* Hours */}
        <div>
          <p className="inline-flex items-center gap-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55">
            <Clock className="h-3 w-3" strokeWidth={2} />
            Hours
          </p>
          <ul className="mt-2 space-y-1">
            {CLINIC_HOURS.map((h) => (
              <li
                key={h.day}
                className="flex items-center justify-between font-body text-[12px] text-[#1F1F1F]/75"
              >
                <span className="font-heading font-semibold text-[#163F33]/80">
                  {h.day}
                </span>
                <span>{h.hours}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phones + email */}
        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55">
            Reach the clinic
          </p>
          <ul className="mt-2 space-y-2">
            <li>
              <a
                href={telLink(CLINIC_PHONE_PRIMARY)}
                className="inline-flex items-center gap-2 font-heading text-[12.5px] font-semibold text-[#163F33] hover:text-[#D4AF37]"
              >
                <Phone className="h-3 w-3" strokeWidth={2} />
                {CLINIC_PHONE_PRIMARY}
              </a>
            </li>
            <li>
              <a
                href={telLink(CLINIC_PHONE_ALT_1)}
                className="inline-flex items-center gap-2 font-body text-[12px] text-[#1F1F1F]/65 hover:text-[#D4AF37]"
              >
                <Phone className="h-3 w-3" strokeWidth={2} />
                {CLINIC_PHONE_ALT_1}
              </a>
            </li>
            <li>
              <a
                href={mailtoLink()}
                className="inline-flex items-center gap-2 font-body text-[12px] text-[#1F1F1F]/65 hover:text-[#D4AF37]"
              >
                <Mail className="h-3 w-3" strokeWidth={2} />
                {CLINIC_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
