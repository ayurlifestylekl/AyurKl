import { requireStaff } from '@/lib/staff/guard'
import { getDoctorPatients } from '@/lib/staff/appointments'
import BookingQueue from '@/components/staff/BookingQueue'
import AutoRefresh from '@/components/staff/AutoRefresh'

export const dynamic = 'force-dynamic'

export default async function DoctorDashboardPage() {
  const { db } = await requireStaff(['admin', 'doctor'])
  const patients = await getDoctorPatients(db)

  const todayStr = new Date().toDateString()
  const today = patients.filter((p) => p.appointmentDatetime && new Date(p.appointmentDatetime).toDateString() === todayStr)
  const upcoming = patients.filter((p) => !p.appointmentDatetime || new Date(p.appointmentDatetime).toDateString() !== todayStr)

  return (
    <div>
      <AutoRefresh />
      <h1 className="font-heading text-[22px] font-extrabold text-primary">Doctor dashboard</h1>
      <p className="mb-5 font-body text-[13px] text-dark/55">Your booked patients. Open one for health details and clinical notes.</p>

      <section className="mb-8">
        <h2 className="mb-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Today</h2>
        <BookingQueue appointments={today} linkBase="/doctor" emptyLabel="No appointments today." />
      </section>

      <section>
        <h2 className="mb-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Upcoming</h2>
        <BookingQueue appointments={upcoming} linkBase="/doctor" emptyLabel="No upcoming appointments." />
      </section>
    </div>
  )
}
