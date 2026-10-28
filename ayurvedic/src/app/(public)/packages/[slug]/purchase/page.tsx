import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPackageBySlug } from '@/lib/packages/queries'
import { isCardPaymentEnabled } from '@/lib/payments'
import PackagePurchaseForm from './PackagePurchaseForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Buy Package | Kerala Ayurvedic Lifestyle',
  robots: { index: false, follow: false },
}

export default async function PackagePurchasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const pkg = await getPackageBySlug(supabase, slug)
  if (!pkg) notFound()

  return (
    <section className="bg-cream pb-20">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="text-center">
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            Deepawali Promo
          </div>
          <h1 className="mt-2 font-heading text-[26px] font-extrabold tracking-[-0.02em] text-primary">
            {pkg.name}
          </h1>
          <p className="mt-1 font-heading text-[22px] font-extrabold text-accent">RM{pkg.priceRm}</p>
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-dark/50">
            {pkg.sessionCount} sessions · valid 1 year from purchase
          </p>
        </div>

        <div className="mt-10">
          <PackagePurchaseForm
            packageSlug={pkg.slug}
            packageName={pkg.name}
            priceRm={pkg.priceRm}
            cardEnabled={isCardPaymentEnabled()}
          />
        </div>
      </div>
    </section>
  )
}
