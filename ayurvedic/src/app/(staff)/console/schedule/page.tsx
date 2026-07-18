import { requireStaff } from '@/lib/staff/guard'
import { getDaySchedule } from '@/lib/staff/appointments'
import { getTreatmentsFlat } from '@/lib/storefront/treatments'
import { THERAPISTS } from '@/lib/staff/therapists'
import { mytDayKey } from '@/lib/datetime'
import ScheduleGrid from '@/components/staff/ScheduleGrid'
import AutoRefresh from '@/components/staff/AutoRefresh'

export const dynamic = 'force-dynamic'

export default async function ConsoleSchedulePage({ searchParams }: { searchParams: { date?: string } }) {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const date = searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date) ? searchParams.date : mytDayKey(new Date())
  const [day, treatments] = await Promise.all([getDaySchedule(db, date), getTreatmentsFlat(db)])

  return (
    <div>
      <AutoRefresh />
      <h1 className="font-heading text-[22px] font-extrabold text-primary">Schedule</h1>
      <p className="mb-4 font-body text-[13px] text-dark/55">
        Day view by therapist. Tap an appointment to open it, a free slot to book it,
        or a block to edit/remove it.
      </p>
      <ScheduleGrid
        basePath="/console/schedule"
        detailBase="/console"
        date={date}
        therapists={THERAPISTS}
        appts={day.appts}
        unassigned={day.unassigned}
        blocks={day.blocks}
        editable
        treatments={treatments.map((t) => ({
          id: t._id,
          title: t.title,
          duration: t.duration ?? null,
          price: t.price ?? null,
          bookingType: t.bookingType ?? 'direct',
        }))}
      />
    </div>
  )
}
