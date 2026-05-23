import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getStorefrontProducts } from '@/lib/storefront/products'
import ProductsHeroManifesto from '@/components/products/ProductsHeroManifesto'
import ProductsPageClient from '@/components/products/ProductsPageClient'

export const metadata: Metadata = {
  title: 'The Apothecary — Authentic Kerala Ayurvedic Products',
  description:
    'Shop authentic Kerala Ayurvedic herbal oils, churnas and wellness kits. Hand-blended formulas sourced from Kerala\'s finest pharmacies — Kesha Thailam, Triphala, Kumkumadi and more.',
  alternates: { canonical: '/products' },
  robots: { index: true, follow: true },
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const initialCategory = params.category || 'all'
  const supabase = await createClient()
  const products = await getStorefrontProducts(supabase)

  return (
    <>
      <ProductsHeroManifesto productCount={products.length} />
      <ProductsPageClient
        products={products}
        initialCategory={initialCategory}
      />
    </>
  )
}
