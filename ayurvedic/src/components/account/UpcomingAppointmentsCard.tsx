import { Calendar } from 'lucide-react'
import AppointmentRow from './AppointmentRow'
import EmptyState from './EmptyState'
import type { Database } from '@/lib/database.types'

type AppointmentRowType = Database['public']['Tables']['appointments']['Row']

interface UpcomingAppointmentsCardProps {
  appointments: AppointmentRowType[]
}

export default function UpcomingAppointmentsCard({
  appointments,
}: UpcomingAppointmentsCardProps) {
  return (
    <section
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-[#1e3d32]/6 px-5 py-3 sm:px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1e3d32]/[0.06]">
          <Calendar className="h-3.5 w-3.5 text-[#2F5D50]" strokeWidth={1.8} />
        </span>
        <h2 className="font-heading text-[13px] font-semibold text-[#1e3d32]">
          Upcoming consultations
        </h2>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No consultations scheduled"
          body="Book your first session with Vaidya Akhil — a personalised Ayurvedic consultation."
          ctaLabel="Book a session"
          ctaHref="/book/consultation"
        />
      ) : (
        <ul className="divide-y divide-[#1e3d32]/6">
          {appointments.map((apt) => (
            <li key={apt.id}>
              <AppointmentRow appointment={apt} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
