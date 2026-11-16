'use server'

import { requireStaff } from '@/lib/staff/guard'
import { searchReturningClients, type ReturningClient } from '@/lib/staff/patients'

/** "Find existing client" on the console booking forms (front desk + admin). */
export async function findReturningClients(query: string): Promise<ReturningClient[]> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  return searchReturningClients(db, query)
}
