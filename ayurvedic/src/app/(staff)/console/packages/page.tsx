import { requireStaff } from '@/lib/staff/guard'
import { getAllPackagesForStaff, getRecentPackagePurchases } from '@/lib/packages/queries'
import { getPromoStats } from '@/lib/packages/promo-stats'
import PackagesManager from '@/components/staff/PackagesManager'
import PromoClicksPanel from '@/components/staff/PromoClicksPanel'

export const dynamic = 'force-dynamic'

export default async function PackagesPage() {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const [catalog, purchases] = await Promise.all([
    getAllPackagesForStaff(db),
    getRecentPackagePurchases(db),
  ])
  const promoStats = await getPromoStats(db, catalog)

  return (
    <div>
      <h1 className="font-heading text-[22px] font-extrabold text-primary">Deepawali Packages</h1>
      <p className="mb-5 font-body text-[13px] text-dark/55">
        Log a sale when a WhatsApp enquiry turns into a purchase, then mark a session used each time
        that customer comes in. Search by name, phone, or email to find a customer&rsquo;s remaining sessions.
      </p>
      <PromoClicksPanel stats={promoStats} />
      <PackagesManager catalog={catalog} initialPurchases={purchases} />
    </div>
  )
}
