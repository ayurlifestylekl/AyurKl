import { requireStaff } from '@/lib/staff/guard'
import { getIncomingRequests, redactContactList } from '@/lib/staff/appointments'
import BookingQueue from '@/components/staff/BookingQueue'
import AutoRefresh from '@/components/staff/AutoRefresh'

export const dynamic = 'force-dynamic'

export default async function DoctorRequestsPage() {
  const { db, role } = await requireStaff(['admin', 'doctor'])
  const raw = await getIncomingRequests(db)
  const requests = role === 'doctor' ? redactContactList(raw) : raw
  const pending = requests.filter((r) => r.status === 'pending')
  const awaiting = requests.filter((r) => r.status !== 'pending')

  return (
    <div>
      <AutoRefresh />
      <h1 className="font-heading text-[22px] font-extrabold text-primary">Requests</h1>
      <p className="mb-5 font-body text-[13px] text-dark/55">
        New booking &amp; consultation requests. Open one to approve and assign a therapist — front desk and admin see these too.
      </p>

      <section className="mb-8">
        <h2 className="mb-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Awaiting approval</h2>
        <BookingQueue appointments={pending} linkBase="/doctor" emptyLabel="No new requests right now." />
      </section>

      <section>
        <h2 className="mb-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Approved · awaiting payment</h2>
        <BookingQueue appointments={awaiting} linkBase="/doctor" emptyLabel="Nothing awaiting payment." />
      </section>
    </div>
  )
}
