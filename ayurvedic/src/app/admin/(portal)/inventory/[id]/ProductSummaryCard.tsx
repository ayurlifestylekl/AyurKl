import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ProductSummaryCard({
  product,
}: {
  product: {
    id: string
    name: string
    sku: string
    slug: string | null
    category: string | null
    status: string
    image_url: string | null
  }
}) {
  return (
    <div className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
      <div className="flex items-center gap-3">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt=""
            className="h-12 w-12 rounded-lg border border-[#1e3d32]/10 object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg border border-dashed border-[#1e3d32]/15 bg-[#FAF6EE]/40" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[13px] font-semibold text-[#1e3d32]">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#2B2B2B]/55">{product.sku}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
        <dt className="text-[#2B2B2B]/55">Category</dt>
        <dd className="text-right">{product.category ?? '—'}</dd>
        <dt className="text-[#2B2B2B]/55">Status</dt>
        <dd className="text-right capitalize">{product.status}</dd>
      </dl>
      <Link
        href={`/admin/products/${product.id}`}
        className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#D4A373] hover:text-[#1e3d32]"
      >
        Edit product details
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
