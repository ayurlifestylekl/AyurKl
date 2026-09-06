import type { FeaturedProduct } from '@/types/content'

/**
 * Homepage "Best Sellers" fallback. FeaturedProducts.tsx only falls back to
 * this when the `initialProducts` prop (real products from Supabase, passed
 * in from src/app/(public)/page.tsx) is empty.
 *
 * Deliberately empty — see src/data/products.ts for why. The real bestseller
 * list is whatever is `status: active` in Product Management (/admin/products);
 * this should not be repopulated with demo/placeholder items.
 */
export const featuredProducts: FeaturedProduct[] = []
