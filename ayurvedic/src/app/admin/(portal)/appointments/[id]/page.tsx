import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Video, MapPin, Calendar, Stethoscope } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getAppointmentById } from '@/lib/admin/appointments/queries'
import {
  STATUS_LABELS,
  type AppointmentStatus,
} from '@/lib/admin/appointments/status-transitions'
import {
  DEMO_ADMIN_EMAIL,
  isMockAppointmentId,
  MOCK_APPOINTMENTS,
} from '@/lib/admin/appointments/mocks'
import StatusDialog from './StatusDialog'
import InternalNotesPanel from './InternalNotesPanel'

export const metadata = { title: 'Appointment · Admin' }
export const dynamic = 'force-dynamic'

const STATUS_CLASS: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  scheduled:   'bg-blue-50 text-blue-700 border-blue-200',
  confirmed:   'bg-blue-100 text-blue-800 border-blue-300',
  checked_in:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-violet-50 text-violet-700 border-violet-200',
  completed:   'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled:   'bg-red-50 text-red-700 border-red-200',
  no_show:     'bg-orange-50 text-orange-700 border-orange-200',
  rescheduled: 'bg-slate-100 text-slate-700 border-slate-300',
}

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const me = await getCurrentUser()
  const isDemoAdmin = me?.email === DEMO_ADMIN_EMAIL

  let appointment
  if (isDemoAdmin && isMockAppointmentId(params.id)) {
    const m = MOCK_APPOINTMENTS.find((a) => a.id === params.id)
    if (!m) notFound()
    appointment = {
      id: m.id,
      customer_id: m.customerId,
      treatment_name: m.treatmentName,
      doctor_name: m.doctorName,
      appointment_date_time: m.appointmentDateTime,
      duration_mins: m.durationMins,
      status: m.status,
      mode: m.mode,
      room: m.room,
      meeting_link: null,
      advance_payment_rm: m.advancePaymentRm,
      advance_payment_status: m.advancePaymentStatus,
      calcom_booking_uid: m.calcomBookingUid,
      notes: 'Customer prefers room with natural light.',
      internal_notes: null,
      gender_requirement: 'any',
      cancellation_reason: m.status === 'cancelled' ? 'Customer requested change.' : null,
      customer: m.customerId
        ? {
            id: m.customerId,
            full_name: m.customerName,
            email: m.customerEmail,
            phone_number: m.customerPhone,
            date_of_birth: null,
            gender: null,
            allergies: null,
            current_medications: null,
            medical_conditions: null,
          }
        : null,
      rescheduled_from: null,
      updated_at: m.appointmentDateTime,
    }
  } else {
    appointment = await getAppointmentById(supabase, params.id)
    if (!appointment) notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a: any = appointment
  const cust = Array.isArray(a.customer) ? a.customer[0] : a.customer
  const isMock = isDemoAdmin && isMockAppointmentId(params.id)
  const dt = new Date(a.appointment_date_time)

  const genderReq: 'any' | 'men_only' | 'ladies_only' = a.gender_requirement ?? 'any'
  const custGender: 'male' | 'female' | null = cust?.gender ?? null
  const genderMismatch =
    genderReq === 'men_only' && custGender !== 'male'
      ? 'This is a men-only therapy but customer is on file as female.'
      : genderReq === 'ladies_only' && custGender !== 'female'
        ? 'This is a ladies-only therapy but customer is on file as male.'
        : null
  const GENDER_REQ_LABEL: Record<typeof genderReq, string> = {
    any: 'Any',
    men_only: 'Men only',
    ladies_only: 'Ladies only',
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Link
        href="/admin/appointments"
        className="text-[11px] uppercase tracking-wider text-[#163F33]/55 hover:text-[#D4AF37]"
      >
        ← Back to appointments
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-[24px] font-bold text-[#163F33]">
              {a.treatment_name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_CLASS[a.status] ?? ''}`}
            >
              {STATUS_LABELS[a.status as AppointmentStatus]}
            </span>
            {isMock ? (
              <span className="rounded-full border border-[#D4AF37]/40 bg-[#F7F2E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a6a3d]">
                Demo data
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12.5px] text-[#1F1F1F]/65">
            <Calendar className="inline h-3.5 w-3.5" />{' '}
            {dt.toLocaleString('en-MY', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {a.duration_mins} min · {a.doctor_name}
          </p>
        </div>
        <StatusDialog
          appointmentId={a.id}
          currentStatus={a.status}
          currentDateTime={a.appointment_date_time}
        />
      </header>

      {genderMismatch ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900">
          <strong>⚠️ Gender rule mismatch:</strong> {genderMismatch} Verify with the
          customer or update their gender on file before checking them in.
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#163F33]/8 bg-white p-4 lg:col-span-2">
          <h2 className="font-heading text-[12.5px] font-semibold text-[#163F33]">
            Session details
          </h2>
          <dl className="mt-3 grid grid-cols-3 gap-y-2 text-[12.5px]">
            <dt className="col-span-1 text-[#1F1F1F]/55">Treatment</dt>
            <dd className="col-span-2">{a.treatment_name}</dd>
            <dt className="col-span-1 text-[#1F1F1F]/55">Duration</dt>
            <dd className="col-span-2">{a.duration_mins} minutes</dd>
            <dt className="col-span-1 text-[#1F1F1F]/55">Mode</dt>
            <dd className="col-span-2">
              {a.mode === 'virtual' ? (
                <span className="inline-flex items-center gap-1 text-violet-700">
                  <Video className="h-3.5 w-3.5" /> Virtual
                  {a.meeting_link ? (
                    <a
                      href={a.meeting_link}
                      target="_blank"
                      rel="noopener"
                      className="ml-2 text-[11px] underline"
                    >
                      Open link
                    </a>
                  ) : null}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#163F33]">
                  <MapPin className="h-3.5 w-3.5" /> In-person
                  {a.room ? ` · ${a.room}` : ''}
                </span>
              )}
            </dd>
            <dt className="col-span-1 text-[#1F1F1F]/55">Vaidya</dt>
            <dd className="col-span-2">
              <Stethoscope className="mr-1 inline h-3.5 w-3.5" />
              {a.doctor_name}
            </dd>
            <dt className="col-span-1 text-[#1F1F1F]/55">Advance pmt</dt>
            <dd className="col-span-2">
              {a.advance_payment_rm != null
                ? `RM ${Number(a.advance_payment_rm).toFixed(2)} · ${a.advance_payment_status ?? 'pending'}`
                : '—'}
            </dd>
            <dt className="col-span-1 text-[#1F1F1F]/55">Gender rule</dt>
            <dd className="col-span-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${
                  genderReq === 'any'
                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                    : 'border-[#D4AF37]/40 bg-[#F7F2E8] text-[#8a6a3d]'
                }`}
              >
                {GENDER_REQ_LABEL[genderReq]}
              </span>
              {custGender ? (
                <span className="ml-2 text-[11.5px] text-[#1F1F1F]/65">
                  Customer:{' '}
                  <span className="capitalize">{custGender}</span>
                  {genderMismatch ? (
                    <span className="text-red-700"> · mismatch</span>
                  ) : genderReq !== 'any' ? (
                    <span className="text-emerald-700"> · match</span>
                  ) : null}
                </span>
              ) : (
                <span className="ml-2 text-[11.5px] text-[#1F1F1F]/55 italic">
                  Customer gender not on file
                </span>
              )}
            </dd>
            {a.notes ? (
              <>
                <dt className="col-span-1 text-[#1F1F1F]/55">Customer note</dt>
                <dd className="col-span-2 italic">{a.notes}</dd>
              </>
            ) : null}
            {a.cancellation_reason ? (
              <>
                <dt className="col-span-1 text-[#1F1F1F]/55">Cancel reason</dt>
                <dd className="col-span-2 italic text-red-700">{a.cancellation_reason}</dd>
              </>
            ) : null}
          </dl>
        </article>

        <article className="rounded-2xl border border-[#163F33]/8 bg-white p-4">
          <h2 className="font-heading text-[12.5px] font-semibold text-[#163F33]">Customer</h2>
          {cust ? (
            <>
              <p className="mt-2 text-[13px] font-semibold">{cust.full_name ?? '—'}</p>
              <p className="text-[12px] text-[#1F1F1F]/65">{cust.email}</p>
              <p className="text-[12px] text-[#1F1F1F]/65">{cust.phone_number}</p>
              {cust.allergies || cust.current_medications || cust.medical_conditions ? (
                <div className="mt-3 border-t border-[#163F33]/6 pt-3 text-[11.5px]">
                  <p className="font-semibold text-[#163F33]">Health flags</p>
                  {cust.allergies ? (
                    <p className="mt-1">
                      <span className="text-[#1F1F1F]/55">Allergies: </span>
                      {cust.allergies}
                    </p>
                  ) : null}
                  {cust.current_medications ? (
                    <p>
                      <span className="text-[#1F1F1F]/55">Meds: </span>
                      {cust.current_medications}
                    </p>
                  ) : null}
                  {cust.medical_conditions ? (
                    <p>
                      <span className="text-[#1F1F1F]/55">Conditions: </span>
                      {cust.medical_conditions}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {a.customer_id ? (
                <Link
                  href={`/admin/customers/${a.customer_id}`}
                  className="mt-3 inline-block text-[11.5px] font-semibold text-[#D4AF37] hover:text-[#163F33]"
                >
                  View full profile →
                </Link>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[12px] italic text-[#1F1F1F]/55">No customer linked.</p>
          )}
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InternalNotesPanel appointmentId={a.id} initial={a.internal_notes} />
        <article className="rounded-2xl border border-[#163F33]/8 bg-white p-4">
          <h3 className="font-heading text-[12.5px] font-semibold text-[#163F33]">
            Cal.com sync
          </h3>
          {a.calcom_booking_uid ? (
            <p className="mt-2 text-[12px]">
              <span className="text-[#1F1F1F]/55">Booking UID:</span>{' '}
              <code className="font-mono text-[11px]">{a.calcom_booking_uid}</code>
            </p>
          ) : (
            <p className="mt-2 text-[12px] italic text-[#1F1F1F]/55">
              Created in admin — not synced from Cal.com.
            </p>
          )}
          <p className="mt-3 text-[11px] text-[#1F1F1F]/55">
            Cal.com → our system: webhook-based (
            <a href="/api/webhooks/calcom" className="underline">
              /api/webhooks/calcom
            </a>
            ).
            <br />
            Our system → Cal.com: not implemented — when you reschedule or cancel
            here, also update Cal.com manually.
          </p>
        </article>
      </section>
    </div>
  )
}
