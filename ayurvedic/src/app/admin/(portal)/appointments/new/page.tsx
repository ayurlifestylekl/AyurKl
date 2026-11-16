import { redirect } from 'next/navigation'

// Walk-ins are booked in the Bookings Console, which applies the same-gender
// therapist rule, clash checks and customer emails. The old admin-only form
// skipped all of those and wrote to columns the appointments table doesn't have.
export default function NewWalkInPage() {
  redirect('/console/new')
}
