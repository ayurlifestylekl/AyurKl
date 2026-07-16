import Link from 'next/link'
import {
  Clock,
  MapPin,
  Video,
  ExternalLink,
  CalendarPlus,
  RotateCw,
  XCircle,
  MessageCircle,
  Navigation,
  RefreshCcw,
  ArrowRight,
} from 'lucide-react'
import AppointmentStatusPill from './AppointmentStatusPill'
import { findTherapyByName } from '@/data/therapies'
import {
  appointmentBucket,
  canCancelInApp,
  isJoinableNow,
} from '@/lib/appointments/policy'
import type { AppointmentRow } from '@/lib/dashboard/appointment-queries'

interface AppointmentListCardProps {
  appointment: AppointmentRow
}

const CLINIC_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Kerala+Ayurvedic+Lifestyle+Brickfields+Kuala+Lumpur'

const dayFormat = new Intl.DateTimeFormat('en-MY', { weekday: 'short' })
const monthFormat = new Intl.DateTimeFormat('en-MY', { month: 'short' })
const dayNumFormat = new Intl.DateTimeFormat('en-MY', { day: 'numeric' })
const timeFormat = new Intl.DateTimeFormat('en-MY', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})
const yearFormat = new Intl.DateTimeFormat('en-MY', { year: 'numeric' })

export default function AppointmentListCard({ appointment }: AppointmentListCardProps) {
  const start = new Date(appointment.appointment_date_time)
  const bucket = appointmentBucket(appointment)
  const therapy = findTherapyByName(appointment.treatment_name)
  const isVirtual = appointment.mode === 'virtual'
  const uid = appointment.calcom_booking_uid

  const whatsappChangeUrl = `https://wa.me/601165043436?text=${encodeURIComponent(
    `Hi Kerala Ayurvedic, I need to change my ${appointment.treatment_name} appointment.`
  )}`

  // Cast: the hand-maintained DB type predates awaiting_payment.
  const status = appointment.status as string
  const needsAction = status === 'awaiting_payment'
  const isFuture = (bucket === 'upcoming' || bucket === 'today') && !needsAction
  const canJoin =
    isFuture &&
    isVirtual &&
    Boolean(appointment.meeting_link) &&
    isJoinableNow(appointment.appointment_date_time, appointment.duration_mins)
  const canCancel = isFuture && canCancelInApp(appointment.appointment_date_time)

  const followUpHref = therapy
    ? `/book/treatment?slug=${therapy.slug}`
    : '/book/treatment'

  return (
    <article
      className="overflow-hidden rounded-3xl border border-[#6E1023]/8 bg-white transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/35"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(110,16,35,0.04), 0 12px 30px -16px rgba(110,16,35,0.18)',
      }}
    >
      <div className="flex items-stretch gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
        {/* Date block */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-[#F7F2E8] px-3 py-2.5 text-center min-w-[64px] sm:min-w-[72px]">
          <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#6E1023]/55">
            {dayFormat.format(start)}
          </span>
          <span
            className="mt-0.5 font-heading text-[22px] font-bold leading-none text-[#6E1023] sm:text-[24px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            {dayNumFormat.format(start)}
          </span>
          <span className="mt-0.5 font-heading text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#6E1023]/55">
            {monthFormat.format(start)} {yearFormat.format(start)}
          </span>
        </div>

        {/* Main info */}
        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentStatusPill bucket={bucket} />
            {isVirtual ? (
              <span className="inline-flex items-center gap-1 font-body text-[11.5px] text-[#6E1023]/85">
                <Video className="h-3 w-3" strokeWidth={2} />
                Virtual
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-body text-[11.5px] text-[#6E1023]/55">
                <MapPin className="h-3 w-3" strokeWidth={2} />
                Brickfields, KL
              </span>
            )}
          </div>
          <h3
            className="truncate font-heading text-[15px] font-bold text-[#6E1023]"
            style={{ letterSpacing: '-0.005em' }}
          >
            {appointment.treatment_name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-[12px] text-[#1F1F1F]/60">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeFormat.format(start)} · {appointment.duration_mins} min
            </span>
            <span className="text-[#D4AF37]">·</span>
            <span>{appointment.doctor_name}</span>
          </div>
        </div>

        {/* Right side: advance payment */}
        {appointment.advance_payment_rm != null && (
          <div className="hidden shrink-0 flex-col items-end justify-center sm:flex">
            <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#6E1023]/45">
              Advance
            </span>
            <span
              className="font-heading text-[15px] font-bold leading-none text-[#6E1023]"
              style={{ letterSpacing: '-0.01em' }}
            >
              RM {Number(appointment.advance_payment_rm).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Footer actions row — state-driven */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#6E1023]/6 px-5 py-2.5 sm:px-6">
        {needsAction && (
          <Link
            href={`/book/request/${appointment.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3.5 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F1F1F] transition-all hover:bg-[#D4AF37]/90"
          >
            Pay now
            <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
          </Link>
        )}

        {isFuture && (
          <>
            {canJoin && appointment.meeting_link && (
              <a
                href={appointment.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F1F1F] transition-all hover:bg-[#D4AF37]"
              >
                <Video className="h-3 w-3" strokeWidth={2.2} />
                Join call
              </a>
            )}
            {!isVirtual && (
              <a
                href={CLINIC_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#6E1023]/12 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E1023]/65 transition-all hover:border-[#6E1023]/25 hover:text-[#6E1023]"
              >
                <Navigation className="h-3 w-3" strokeWidth={2} />
                Directions
              </a>
            )}
            <a
              href={`/account/appointments/${appointment.id}/ics`}
              download
              className="inline-flex items-center gap-1.5 rounded-full border border-[#6E1023]/12 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E1023]/65 transition-all hover:border-[#6E1023]/25 hover:text-[#6E1023]"
            >
              <CalendarPlus className="h-3 w-3" strokeWidth={2} />
              Calendar
            </a>
            {uid ? (
              <>
                <a
                  href={whatsappChangeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6E1023]/12 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E1023]/65 transition-all hover:border-[#6E1023]/25 hover:text-[#6E1023]"
                >
                  <RotateCw className="h-3 w-3" strokeWidth={2} />
                  Reschedule
                </a>
                {canCancel ? (
                  <a
                    href={`/book/request/${appointment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700/80 transition-all hover:border-red-300 hover:bg-red-50/40"
                  >
                    <XCircle className="h-3 w-3" strokeWidth={2} />
                    Cancel
                  </a>
                ) : (
                  <a
                    href={whatsappChangeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#6E1023]/12 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold tracking-[0.03em] text-[#1F1F1F]/65 transition-all hover:border-[#6E1023]/25"
                    title="Within 48 hours of the visit — please message us."
                  >
                    <MessageCircle className="h-3 w-3" strokeWidth={2} />
                    WhatsApp us
                  </a>
                )}
              </>
            ) : (
              <a
                href={whatsappChangeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#6E1023]/12 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E1023]/65 transition-all hover:border-[#6E1023]/25"
              >
                <MessageCircle className="h-3 w-3" strokeWidth={2} />
                WhatsApp to change
              </a>
            )}
          </>
        )}

        {bucket === 'past' && (
          <>
            <Link
              href="#aftercare"
              scroll
              className="inline-flex items-center gap-1.5 rounded-full border border-[#6E1023]/12 bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E1023]/65 transition-all hover:border-[#6E1023]/25"
            >
              View aftercare
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href={followUpHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6E1023] px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[#6E1023]"
            >
              <RefreshCcw className="h-3 w-3" strokeWidth={2} />
              Book follow-up
            </Link>
          </>
        )}

        {bucket === 'cancelled' && (
          <Link
            href={followUpHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#6E1023] px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[#6E1023]"
          >
            <RefreshCcw className="h-3 w-3" strokeWidth={2} />
            Re-book
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
  )
}
