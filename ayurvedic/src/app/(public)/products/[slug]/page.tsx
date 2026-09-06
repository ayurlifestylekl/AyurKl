import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getStorefrontProducts,
  getStorefrontProductBySlug,
} from '@/lib/storefront/products'
import { categories } from '@/data/categories'
import ProductGallery from '@/components/products/detail/ProductGallery'
import ProductMeta from '@/components/products/detail/ProductMeta'
import ProductReviews from '@/components/products/detail/ProductReviews'
import RelatedProducts from '@/components/products/detail/RelatedProducts'

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const product = await getStorefrontProductBySlug(supabase, slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description,
    alternates: { canonical: `/products/${product.id}` },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const product = await getStorefrontProductBySlug(supabase, slug)
  if (!product) notFound()

  const categoryLabel =
    categories.find((c) => c.slug === product.category)?.label ??
    product.category.replace('-', ' ')

  const all = await getStorefrontProducts(supabase)
  const related = all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3)

  return (
    <section className="relative bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 md:py-14 lg:px-12">
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 font-heading text-[10.5px] font-bold uppercase tracking-[0.16em] text-primary/55 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          ← Back to the Apothecary
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[38fr_62fr] lg:gap-14">
          <ProductGallery product={product} />
          <ProductMeta product={product} categoryLabel={categoryLabel} />
        </div>

        <ProductReviews productId={product.id} />

        <RelatedProducts products={related} />
      </div>
    </section>
  )
}
