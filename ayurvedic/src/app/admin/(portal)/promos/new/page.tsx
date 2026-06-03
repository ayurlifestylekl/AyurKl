import Link from 'next/link'
import PromoForm from '../[id]/PromoForm'

export const metadata = { title: 'New Voucher · Admin' }

export default function NewPromoPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        href="/admin/promos"
        className="text-[11px] uppercase tracking-wider text-[#163F33]/55 hover:text-[#D4AF37]"
      >
        ← Back to vouchers
      </Link>
      <header>
        <h1 className="font-heading text-[24px] font-bold text-[#163F33]">New voucher</h1>
        <p className="mt-1 text-[12.5px] text-[#1F1F1F]/65">
          A reusable promo template. Public codes can be redeemed by anyone; private codes are
          used for individual voucher pushes.
        </p>
      </header>
      <PromoForm mode="create" />
    </div>
  )
}
