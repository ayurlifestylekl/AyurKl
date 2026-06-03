import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  CalendarPlus,
  RotateCw,
  XCircle,
  MessageCircle,
  Navigation,
} from 'lucide-react'
import { findTherapyByName, GENERIC_PRE_VISIT } from '@/data/therapies'
import { getCancelUrl, getRescheduleUrl, getBookingUrl } from '@/lib/calcom/links'
import {
  canCancelInApp,
  countdownLabel,
  isJoinableNow,
} from '@/lib/appointments/policy'
import type { AppointmentRow } from '@/lib/dashboard/appointment-queries'
import PreVisitChecklist from './PreVisitChecklist'

interface NextAppointmentHeroProps {
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

export default function NextAppointmentHero({ appointment }: NextAppointmentHeroProps) {
  const start = new Date(appointment.appointment_date_time)
  const therapy = findTherapyByName(appointment.treatment_name)
  const preVisitItems = therapy?.preVisit ?? GENERIC_PRE_VISIT
  const countdown = countdownLabel(appointment.appointment_date_time)

  const isVirtual = appointment.mode === 'virtual'
  const canJoin =
    isVirtual &&
    Boolean(appointment.meeting_link) &&
    isJoinableNow(appointment.appointment_date_time, appointment.duration_mins)
  const canCancel = canCancelInApp(appointment.appointment_date_time)
  const uid = appointment.calcom_booking_uid

  const whatsappCancelUrl = `https://wa.me/601165043436?text=${encodeURIComponent(
    `Hi Kerala Ayurvedic, I need to change my ${appointment.treatment_name} appointment.`
  )}`

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(22, 63, 51,0.04), 0 18px 36px -20px rgba(22, 63, 51,0.22)',
      }}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[#D4AF37]" />

      <div className="px-5 py-6 sm:px-9 sm:py-8 lg:px-10 lg:py-10">
        {/* Top row: Date block + treatment headline + countdown chip */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-stretch gap-5">
            {/* Date block */}
            <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-[#F7F2E8] px-4 py-3 text-center min-w-[76px]">
              <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#163F33]/55">
                {dayFormat.format(start)}
              </span>
              <span
                className="mt-0.5 font-heading text-[28px] font-bold leading-none text-[#163F33]"
                style={{ letterSpacing: '-0.02em' }}
              >
                {dayNumFormat.format(start)}
              </span>
              <span className="mt-0.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#163F33]/55">
                {monthFormat.format(start)}
              </span>
            </div>

            {/* Treatment + Vaidya + time */}
            <div className="flex flex-col justify-center">
              <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
                Your next visit
              </span>
              {therapy?.tagline && (
                <p
                  className="mt-1 italic text-[13px] text-[#D4AF37]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {therapy.tagline}
                </p>
              )}
              <h2
                className="mt-0.5 font-heading text-[24px] font-bold leading-tight text-[#163F33] sm:text-[28px]"
                style={{ letterSpacing: '-0.02em' }}
              >
                {appointment.treatment_name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[12.5px] text-[#1F1F1F]/65">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {timeFormat.format(start)} · {appointment.duration_mins} min
                </span>
                <span className="text-[#D4AF37]">·</span>
                <span>{appointment.doctor_name}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {isVirtual ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E5B4B]/10 px-2.5 py-0.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#1E5B4B]">
                    <Video className="h-3 w-3" strokeWidth={2} />
                    Virtual
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#163F33]/[0.06] px-2.5 py-0.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#163F33]/65">
                    <MapPin className="h-3 w-3" strokeWidth={2} />
                    Brickfields, KL
                  </span>
                )}
                {appointment.advance_payment_rm != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9c6f3e]">
                    Advance RM {Number(appointment.advance_payment_rm).toFixed(2)} paid
                  </span>
                )}
              </div>
            </div>
          </div>

          {countdown && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#F7F2E8]/55 px-3.5 py-1.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#9c6f3e]">
              <Calendar className="h-3 w-3" strokeWidth={2} />
              {countdown}
            </span>
          )}
        </div>

        {/* Primary action row */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {canJoin ? (
            <a
              href={appointment.meeting_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#D4AF37] px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-[#1F1F1F] transition-all hover:bg-[#D4AF37] active:scale-[0.98]"
            >
              <Video className="h-3.5 w-3.5" strokeWidth={2.2} />
              Join consultation
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : !isVirtual ? (
            <a
              href={CLINIC_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#1E5B4B] px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#163F33] active:scale-[0.98]"
            >
              <Navigation className="h-3.5 w-3.5" strokeWidth={2.2} />
              Get directions
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : (
            uid && (
              <a
                href={getBookingUrl(uid)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#1E5B4B] px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#163F33] active:scale-[0.98]"
              >
                View booking
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            )
          )}

          {/* Secondary actions */}
          <a
            href={`/account/appointments/${appointment.id}/ics`}
            download
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#163F33]/15 bg-white px-5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[#163F33] transition-all hover:border-[#163F33]/35"
          >
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2} />
            Add to calendar
          </a>

          {uid ? (
            <a
              href={getRescheduleUrl(uid)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#163F33]/15 bg-white px-5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[#163F33] transition-all hover:border-[#163F33]/35"
            >
              <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
              Reschedule
            </a>
          ) : (
            <a
              href={whatsappCancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#163F33]/15 bg-white px-5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[#163F33] transition-all hover:border-[#163F33]/35"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
              WhatsApp to change
            </a>
          )}

          {uid &&
            (canCancel ? (
              <a
                href={getCancelUrl(uid)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-red-200 bg-white px-5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-red-700/85 transition-all hover:border-red-300 hover:bg-red-50/40"
              >
                <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                Cancel
              </a>
            ) : (
              <a
                href={whatsappCancelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#163F33]/15 bg-white px-5 font-heading text-[11.5px] font-semibold tracking-[0.04em] text-[#1F1F1F]/70 transition-all hover:border-[#163F33]/35"
                title="Cancellations under 48 hours need to go through us directly."
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                Past cancel window · WhatsApp us
              </a>
            ))}
        </div>

        {/* Pre-visit checklist */}
        <div className="mt-6 border-t border-[#163F33]/6 pt-5">
          <PreVisitChecklist items={preVisitItems} />
        </div>

        {/* Policy chip */}
        <p className="mt-4 font-body text-[11px] italic text-[#1F1F1F]/55">
          48 hours&apos; notice required to cancel. Advance payments are non-refundable
          per our practice policy.
        </p>
      </div>
    </section>
  )
}
