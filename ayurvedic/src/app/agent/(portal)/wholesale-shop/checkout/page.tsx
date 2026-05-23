import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { getAgentProfileFull } from '@/lib/agent/profile/queries'
import { listWholesaleCatalog } from '@/lib/agent/wholesale-shop/queries'
import { WholesaleCartProvider } from '@/components/agent/WholesaleCartProvider'
import CheckoutClient from './CheckoutClient'

export const metadata = { title: 'Wholesale Checkout' }
export const dynamic = 'force-dynamic'

export default async function WholesaleCheckoutPage() {
  const me = await getCurrentUser()
  if (!me) redirect('/agent/login')

  const supabase = await createClient()
  const profile = await getAgentProfileFull(supabase, me.profile.id)
  if (!profile) redirect('/agent/dashboard')
  if (!profile.canWholesale) redirect('/agent/dashboard')

  const catalog = await listWholesaleCatalog(supabase)

  return (
    <WholesaleCartProvider>
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Link
          href="/agent/wholesale-shop"
          className="text-[11px] uppercase tracking-wider text-[#1e3d32]/55 hover:text-[#D4A373]"
        >
          ← Back to wholesale shop
        </Link>
        <header>
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4A373]">
            Review & place
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-[#1e3d32]">
            Checkout
          </h1>
        </header>

        <CheckoutClient
          catalog={catalog}
          defaultShippingAddress={profile.shippingAddress ?? ''}
          defaultShippingPostcode={profile.shippingPostcode ?? ''}
          defaultShippingState={profile.shippingState ?? ''}
        />
      </div>
    </WholesaleCartProvider>
  )
}
