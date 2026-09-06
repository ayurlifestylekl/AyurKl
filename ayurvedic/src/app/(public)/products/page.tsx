import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getStorefrontProducts } from '@/lib/storefront/products'
import ProductsPageClient from '@/components/products/ProductsPageClient'
import ProductsHeroManifesto from '@/components/products/ProductsHeroManifesto'
import TrustStrip from '@/components/sections/TrustStrip'

export const metadata: Metadata = {
  title: 'The Apothecary | Kerala Ayurvedic Lifestyle',
  description:
    'Shop authentic Kerala Ayurvedic formulas — herbal oils, churnas, serums and wellness kits, hand-blended and prescribed by our Vaidyas.',
  alternates: { canonical: '/products' },
  robots: { index: true, follow: true },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const supabase = await createClient()
  const products = await getStorefrontProducts(supabase)

  return (
    <main className="min-h-screen bg-cream">
      <ProductsHeroManifesto productCount={products.length} />
      <TrustStrip />
      <div className="mx-auto max-w-7xl px-6 pt-10 sm:px-8 md:pt-14 lg:px-12">
        <header className="mb-8 text-center lg:text-left">
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            The Apothecary
          </span>
          <h1 className="mt-2 font-heading text-[32px] font-bold leading-tight text-[#6E1023] sm:text-[40px]">
            Shop Kerala Ayurvedic Formulas
          </h1>
          <p className="mx-auto mt-2 max-w-2xl font-body text-[14px] text-[#1F1F1F]/65 lg:mx-0">
            Hand-blended herbal oils, churnas, serums and wellness kits — sourced from Kerala and prescribed by our Vaidyas.
          </p>
        </header>
      </div>
      <ProductsPageClient products={products} initialCategory={category} />
    </main>
  )
}
