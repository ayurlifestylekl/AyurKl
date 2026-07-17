import { CalendarClock, CreditCard, RotateCw, XCircle } from 'lucide-react'

import { STATUS_LABEL } from '@/lib/booking/status'
import type { BookingManagementModel } from '@/lib/booking/management'
import {
  getRescheduleFormBookings,
  rescheduleBooking,
} from '@/lib/booking/reschedule'
import { cancelManagedBooking } from '@/lib/booking/cancellation'
import { fmtMY } from '@/lib/datetime'
import GroupManagementPanel from './GroupManagementPanel'
import RescheduleBookingForm from './RescheduleBookingForm'
import CancelBookingDialog from './CancelBookingDialog'

const paymentLabels: Record<BookingManagementModel['payment']['display'], string> = {
  free: 'No payment required',
  unpaid: 'Not paid',
  pending: 'Payment pending',
  paid: 'Paid',
  refund_pending: 'Refund pending',
  refunded: 'Refunded',
  refund_needs_review: 'Refund needs review',
}

function refundCopy(model: BookingManagementModel): string {
  if (model.refund?.status === 'confirmed') return 'Your refund has been confirmed.'
  if (model.refund && ['claimed', 'pending'].includes(model.refund.status)) return 'Your refund request is being processed.'
  if (model.refund && ['failed', 'exception'].includes(model.refund.status)) return 'Our team is reviewing your refund.'
  if (model.refundEligibility === 'not_paid') return 'No refund is needed for this unpaid booking.'
  if (model.refundEligibility === 'mistake_window') return 'A full refund is available within the one-hour mistake window.'
  if (model.refundEligibility === 'advance_window') return 'A full refund is available before the refund deadline.'
  return 'This booking is not currently eligible for an online refund.'
}

export default async function ManageBookingPanel({ model }: { model: BookingManagementModel }) {
  const amount = model.payment.amountRm == null ? null : `RM${model.payment.amountRm.toFixed(2)}`
  const isActiveGroup = model.groupMembers.length > 1
    && model.groupMembers.some((member) => member.id === model.id)
  const rescheduleIds = isActiveGroup
    ? model.groupMembers.map((member) => member.id)
    : [model.id]
  const canRescheduleAny = isActiveGroup
    ? model.groupMembers.some((member) => member.canReschedule)
    : model.canReschedule
  const rescheduleBookings = canRescheduleAny
    ? await getRescheduleFormBookings(rescheduleIds)
    : []

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <div className="overflow-hidden rounded-[26px] bg-white shadow-luxe ring-1 ring-accent/10">
          <div
            className="h-52 bg-cover bg-center"
            style={{ backgroundImage: "url('/authentic-ayurveda.jpg')" }}
          />
          <div className="p-7">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              {model.bookingKind === 'consultation' ? 'Free consultation' : 'Treatment booking'}
            </span>
            <h1 className="mt-2 font-display text-[27px] font-bold leading-tight text-primary">
              {model.treatmentName}
            </h1>
            <dl className="mt-5 space-y-3 border-t border-accent/15 pt-5 font-body text-[13px]">
              <Row label="Guest" value={model.patientName} />
              <Row label="Selected time" value={fmtMY(model.selectedTime, { dateStyle: 'full', timeStyle: 'short' })} />
              <Row label="Status" value={STATUS_LABEL[model.status as keyof typeof STATUS_LABEL] ?? model.status} />
              <Row label="Therapist" value={model.therapist} />
              <Row label="Payment" value={`${paymentLabels[model.payment.display]}${amount ? ` · ${amount}` : ''}`} />
            </dl>
          </div>
        </div>
      </aside>

      <div>
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            Manage booking
          </span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
          Your options, in one place
        </h2>
        <p className="mt-3 max-w-xl font-body text-[14px] leading-6 text-dark/65">
          Availability is calculated from your booking status and the clinic&apos;s current change and refund windows.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <OptionCard
            icon={RotateCw}
            title="Reschedule"
            available={canRescheduleAny}
            body={isActiveGroup
              ? 'Availability is shown separately for every active guest below.'
              : model.canReschedule
                ? `Available until ${fmtMY(model.changeDeadline, { dateStyle: 'medium', timeStyle: 'short' })}.`
                : 'The online rescheduling window is closed for this booking.'}
          />
          <OptionCard
            icon={XCircle}
            title="Cancel"
            available={model.canCancel}
            body={model.canCancel ? 'This booking can be cancelled online.' : 'Online cancellation is not available for this booking.'}
          />
        </div>

        {isActiveGroup && rescheduleBookings.length > 0 ? (
          <GroupManagementPanel
            anchorId={model.id}
            bookings={rescheduleBookings}
            members={model.groupMembers}
            action={rescheduleBooking}
          />
        ) : model.canReschedule && rescheduleBookings.length > 0 ? (
          <RescheduleBookingForm
            anchorId={model.id}
            bookings={rescheduleBookings}
            action={rescheduleBooking}
          />
        ) : null}

        {model.canCancel && (
          <CancelBookingDialog
            anchorId={model.id}
            appointmentIds={isActiveGroup
              ? model.groupMembers.map((m) => m.id)
              : [model.id]}
            wholeGroup={isActiveGroup}
            refundEligibility={model.refundEligibility}
            provider={model.payment.provider}
            action={cancelManagedBooking}
          />
        )}

        <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-accent/15">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 flex-none text-accent" />
            <div>
              <h3 className="font-heading text-[13px] font-bold text-primary">Payment and refund</h3>
              <p className="mt-1 font-body text-[13px] leading-5 text-dark/65">{refundCopy(model)}</p>
              {model.refundEligibility === 'advance_window' && (
                <p className="mt-1 font-body text-[12px] text-dark/50">
                  Refund deadline: {fmtMY(model.refundDeadline, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function OptionCard({
  icon: Icon,
  title,
  available,
  body,
}: {
  icon: typeof CalendarClock
  title: string
  available: boolean
  body: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-accent/15">
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-5 w-5 text-accent" />
        <span className={`rounded-full px-2.5 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.14em] ${available ? 'bg-green-50 text-green-700' : 'bg-dark/5 text-dark/45'}`}>
          {available ? 'Available' : 'Closed'}
        </span>
      </div>
      <h3 className="mt-4 font-heading text-[14px] font-bold text-primary">{title}</h3>
      <p className="mt-1 font-body text-[12.5px] leading-5 text-dark/60">{body}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-dark/45">{label}</dt>
      <dd className="text-right font-semibold text-dark/75">{value}</dd>
    </div>
  )
}
