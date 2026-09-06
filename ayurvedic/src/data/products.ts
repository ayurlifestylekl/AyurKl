import type { Product } from '@/types/content'

/**
 * Storefront fallback catalogue. `getStorefrontProducts` /
 * `getStorefrontProductBySlug` (src/lib/storefront/products.ts) only fall
 * back to this when the Supabase `products` query errors or returns zero
 * active rows — it exists purely so the site never renders truly blank.
 *
 * Deliberately empty: the real catalogue lives in Product Management
 * (/admin/products), and this array previously held unrelated placeholder
 * products (including a fake "Dandra Care Oil") that showed up in place of
 * the real, client-supplied products whenever the DB rows were in draft.
 * Do not repopulate this with demo/placeholder items — add real products
 * via Product Management instead.
 */
export const products: Product[] = []
