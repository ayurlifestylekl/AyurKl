import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Cart — Coming Soon',
  description:
    'Your shopping cart at Kerala Ayurvedic Lifestyle. Online ordering is launching soon.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <ComingSoon
      eyebrow="Your Cart"
      title="Online Ordering Opens Soon."
      subtitle="Our shop is being prepared with the same care as our therapies. To order any product today, message us on WhatsApp and we will dispatch it directly."
      primaryHref="/#featured-products"
      primaryLabel="Browse Bestsellers"
    />
  )
}
