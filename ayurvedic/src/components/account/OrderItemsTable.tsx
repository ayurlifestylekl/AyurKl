import Image from 'next/image'
import { Package } from 'lucide-react'
import type { OrderItemWithProduct } from '@/lib/dashboard/order-queries'

interface OrderItemsTableProps {
  items: OrderItemWithProduct[]
  orderTotal: number
}

export default function OrderItemsTable({ items, orderTotal }: OrderItemsTableProps) {
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price_at_purchase_rm) * it.quantity,
    0
  )

  return (
    <section
      className="overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-[#1e3d32]/6 px-5 py-3 sm:px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1e3d32]/[0.06]">
          <Package className="h-3.5 w-3.5 text-[#2F5D50]" strokeWidth={1.8} />
        </span>
        <h2 className="font-heading text-[13px] font-semibold text-[#1e3d32]">
          Items in this order
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-center font-body text-[12.5px] italic text-[#2B2B2B]/45 sm:px-6">
          No items recorded for this order.
        </p>
      ) : (
        <ul className="divide-y divide-[#1e3d32]/6">
          {items.map((item) => {
            const unit = Number(item.price_at_purchase_rm)
            const line = unit * item.quantity
            return (
              <li
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 sm:gap-5 sm:px-6"
              >
                {/* Product thumb */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#1e3d32]/[0.06] sm:h-14 sm:w-14">
                  {item.product?.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-4 w-4 text-[#1e3d32]/35" strokeWidth={1.6} />
                    </div>
                  )}
                </div>

                {/* Name + qty */}
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate font-heading text-[13px] font-semibold text-[#1e3d32] sm:text-[14px]"
                    style={{ letterSpacing: '-0.005em' }}
                  >
                    {item.product?.name ?? 'Product unavailable'}
                  </p>
                  <p className="mt-0.5 font-body text-[11.5px] text-[#2B2B2B]/55">
                    {item.product?.category ? `${item.product.category} · ` : ''}
                    {item.quantity} × RM {unit.toFixed(2)}
                  </p>
                </div>

                {/* Line total */}
                <span
                  className="shrink-0 font-heading text-[14px] font-bold text-[#1e3d32]"
                  style={{ letterSpacing: '-0.005em' }}
                >
                  RM {line.toFixed(2)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {/* Totals footer */}
      <div className="space-y-1.5 border-t border-[#1e3d32]/6 bg-[#FAF6EE]/40 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between font-body text-[12.5px] text-[#2B2B2B]/65">
          <span>Subtotal</span>
          <span>RM {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 font-heading text-[14px] font-bold text-[#1e3d32]">
          <span>Total</span>
          <span style={{ letterSpacing: '-0.005em' }}>
            RM {Number(orderTotal).toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  )
}
