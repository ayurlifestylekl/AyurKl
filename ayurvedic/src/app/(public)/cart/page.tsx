import type { Metadata } from 'next'
import CartContents from './CartContents'
import ShopComingSoon from '@/components/products/ShopComingSoon'
import { SHOP_OPEN } from '@/lib/storefront/shop'

export const metadata: Metadata = {
  title: 'Your Cart',
  description:
    'Review the herbal formulas, oils, and treatment items saved to your bag at Kerala Ayurvedic Lifestyle.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: false },
}

export default function CartPage() {
  if (!SHOP_OPEN) return <ShopComingSoon />
  return <CartContents />
}
