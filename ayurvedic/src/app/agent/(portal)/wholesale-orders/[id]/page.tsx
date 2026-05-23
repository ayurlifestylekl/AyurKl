import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { getAgentProfileByUserId } from '@/lib/agent/dashboard/queries'
import {
  getAgentWholesaleOrderById,
  WHOLESALE_STATUS_LABEL,
  type WholesaleStatus,
} from '@/lib/agent/wholesale-orders/queries'
import PaymentProofForm from './PaymentProofForm'

export const metadata = { title: 'Wholesale Order' }
export const dynamic = 'force-dynamic'

const STATUS_CLASS: Record<WholesaleStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fulfilling: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export default async function AgentWholesaleOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const me = await getCurrentUser()
  if (!me) redirect('/agent/login')

  const supabase = await createClient()
  const profile = await getAgentProfileByUserId(supabase, me.profile.id)
  if (!profile) redirect('/agent/dashboard')

  const order = await getAgentWholesaleOrderById(supabase, params.id, profile.id)
  if (!order) notFound()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Link
        href="/agent/wholesale-orders"
        className="text-[11px] uppercase tracking-wider text-[#1e3d32]/55 hover:text-[#D4A373]"
      >
        ← Back to my wholesale orders
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-[24px] font-bold text-[#1e3d32]">
              <code className="font-mono">{order.orderNumber}</code>
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_CLASS[order.status] ?? ''}`}
            >
              {WHOLESALE_STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-[#2B2B2B]/65">
            Placed {new Date(order.createdAt).toLocaleString('en-MY')}
          </p>
        </div>
      </header>

      {/* Status-specific banner */}
      {order.status === 'pending_payment' ? (
        <PaymentInstructions
          orderId={order.id}
          orderNumber={order.orderNumber}
          totalRm={order.totalRm}
          paymentProofUrl={order.paymentProofUrl}
        />
      ) : null}

      {order.status === 'shipped' && order.trackingNumber ? (
        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <h3 className="font-heading text-[13px] font-semibold text-purple-900">
            On the way 🚚
          </h3>
          <p className="mt-1 text-[12px] text-purple-800/85">
            Shipped via <strong>{order.courier ?? 'courier'}</strong>. Tracking:{' '}
            <code className="font-mono font-semibold">{order.trackingNumber}</code>
          </p>
        </section>
      ) : null}

      {order.status === 'delivered' ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[12.5px] text-emerald-800">
          ✓ Delivered. Happy reselling!
        </section>
      ) : null}

      {order.status === 'cancelled' && order.cancelReason ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[12.5px] text-red-800">
          <strong>Cancelled:</strong> {order.cancelReason}
        </section>
      ) : null}

      {/* Items + totals + ship-to */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <article className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
          <h2 className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">Items</h2>
          <table className="mt-3 w-full text-left text-[13px]">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">
              <tr>
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3d32]/6">
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2">
                    {it.productName}
                    {it.productSku ? (
                      <span className="ml-2 font-mono text-[10.5px] text-[#2B2B2B]/55">
                        {it.productSku}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">RM {it.unitPriceRm.toFixed(2)}</td>
                  <td className="py-2 text-right font-semibold">
                    RM {it.lineTotalRm.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-[12.5px]">
              <tr>
                <td colSpan={3} className="pt-3 text-right text-[#2B2B2B]/65">
                  Subtotal
                </td>
                <td className="pt-3 text-right">RM {order.subtotalRm.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right text-[#2B2B2B]/65">
                  Shipping
                </td>
                <td className="text-right">RM {order.shippingRm.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="pt-1 text-right font-semibold text-[#1e3d32]">
                  Total
                </td>
                <td className="pt-1 text-right font-semibold text-[#1e3d32]">
                  RM {order.totalRm.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          {order.agentNotes ? (
            <div className="mt-4 rounded-lg border border-[#1e3d32]/8 bg-[#FAF6EE]/30 p-3">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">
                Your note
              </p>
              <p className="mt-1 whitespace-pre-line text-[12px] italic text-[#2B2B2B]/70">
                {order.agentNotes}
              </p>
            </div>
          ) : null}
        </article>

        <aside className="flex flex-col gap-4">
          <article className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
            <h2 className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">
              Ship to
            </h2>
            <p className="mt-2 whitespace-pre-line text-[12.5px] text-[#2B2B2B]/85">
              {order.shippingAddress}
            </p>
            <p className="mt-1 text-[12.5px] text-[#2B2B2B]/65">
              {order.shippingPostcode} {order.shippingState}
            </p>
          </article>

          <article className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
            <h2 className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">
              Timeline
            </h2>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-[#2B2B2B]/70">
              <li>Placed · {new Date(order.createdAt).toLocaleString('en-MY')}</li>
              {order.paidAt ? (
                <li>Payment confirmed · {new Date(order.paidAt).toLocaleString('en-MY')}</li>
              ) : null}
              {order.shippedAt ? (
                <li>
                  Shipped · {new Date(order.shippedAt).toLocaleString('en-MY')}
                </li>
              ) : null}
              {order.deliveredAt ? (
                <li>
                  Delivered · {new Date(order.deliveredAt).toLocaleString('en-MY')}
                </li>
              ) : null}
              {order.cancelledAt ? (
                <li className="text-red-700">
                  Cancelled · {new Date(order.cancelledAt).toLocaleString('en-MY')}
                </li>
              ) : null}
            </ul>
          </article>
        </aside>
      </section>
    </div>
  )
}

function PaymentInstructions({
  orderId,
  orderNumber,
  totalRm,
  paymentProofUrl,
}: {
  orderId: string
  orderNumber: string
  totalRm: number
  paymentProofUrl: string | null
}) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <h3 className="font-heading text-[15px] font-semibold text-amber-900">
        Awaiting your payment
      </h3>
      <p className="mt-1 text-[12.5px] text-amber-900/85">
        Transfer <strong>RM {totalRm.toFixed(2)}</strong> to the clinic, then upload
        your receipt below. Admin confirms and ships once payment arrives.
      </p>

      <div className="mt-3 rounded-2xl bg-white p-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">
          Payment details
        </p>
        <ul className="mt-1.5 space-y-0.5 text-[12px] text-[#2B2B2B]/85">
          <li>
            <strong>Bank:</strong> Maybank
          </li>
          <li>
            <strong>Account name:</strong> Kerala Ayurvedic Lifestyle Sdn Bhd
          </li>
          <li>
            <strong>Account number:</strong> 5142 6788 9012
          </li>
          <li>
            <strong>TNG eWallet:</strong> +60 12-345 6789
          </li>
          <li className="mt-1 italic text-[#2B2B2B]/60">
            Reference: <strong>{orderNumber}</strong>
          </li>
        </ul>
      </div>

      <PaymentProofForm orderId={orderId} existingUrl={paymentProofUrl} />
    </section>
  )
}
