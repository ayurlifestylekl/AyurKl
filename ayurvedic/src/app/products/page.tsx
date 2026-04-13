import type { Metadata } from 'next'
import { products } from '@/data/products'
import ProductsHero from '@/components/products/ProductsHero'
import ProductsPageClient from '@/components/products/ProductsPageClient'

export const metadata: Metadata = {
  title: 'The Apothecary — Authentic Kerala Ayurvedic Products',
  description:
    'Shop authentic Kerala Ayurvedic herbal oils, churnas and wellness kits. Hand-blended formulas sourced from Kerala\'s finest pharmacies — Kesha Thailam, Triphala, Kumkumadi and more.',
  alternates: { canonical: '/products' },
  robots: { index: true, follow: true },
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const initialCategory = params.category || 'all'

  return (
    <>
      <ProductsHero productCount={products.length} />
      <ProductsPageClient
        products={products}
        initialCategory={initialCategory}
      />
    </>
  )
}
