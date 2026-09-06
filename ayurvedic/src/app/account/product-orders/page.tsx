import Link from 'next/link'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { listCustomerProductOrders } from '@/lib/product-management/queries'

export const metadata = { title: 'My Product Orders · Member Portal' }
export const dynamic = 'force-dynamic'

export default async function AccountProductOrdersPage() {
  const me = await getCurrentUser()
  if (!me) redirect('/auth/login?next=/account/product-orders')

  const orders = await listCustomerProductOrders(me.authId, me.email ?? '')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="font-heading text-[28px] font-bold text-[#6E1023]">My Product Orders</h1>
        <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">Track and manage your apothecary orders.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#6E1023]/10 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#F7F2E8]">
            <tr>
              <th className="px-4 py-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-[#6E1023]/70">Order</th>
              <th className="px-4 py-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-[#6E1023]/70">Total</th>
              <th className="px-4 py-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-[#6E1023]/70">Status</th>
              <th className="px-4 py-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-[#6E1023]/70">Date</th>
              <th className="px-4 py-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-[#6E1023]/70" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#6E1023]/8">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#F7F2E8]/40">
                <td className="px-4 py-3 font-heading font-semibold text-[#6E1023]">{order.order_number}</td>
                <td className="px-4 py-3 font-heading font-semibold text-[#163F33]">RM {order.total_rm.toFixed(2)}</td>
                <td className="px-4 py-3 capitalize">{order.status.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-[#1F1F1F]/65">{format(new Date(order.created_at), 'dd MMM yyyy')}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/account/product-orders/${order.id}`}
                    className="rounded-md bg-[#6E1023] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#6E1023]/90"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-6 text-center text-[13px] text-[#1F1F1F]/55">You have no product orders yet.</p>
        )}
      </div>
    </div>
  )
}
