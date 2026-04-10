import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Shop — Coming Soon',
  description:
    'Our full apothecary of authentic Kerala Ayurvedic herbal oils, churnas and wellness kits is launching soon. Browse a preview of bestsellers on the homepage.',
  alternates: { canonical: '/products' },
  robots: { index: false, follow: true },
}

export default function ProductsPage() {
  return (
    <ComingSoon
      eyebrow="Apothecary"
      title="Our Full Shop Opens Soon."
      subtitle="Hand-blended Kerala formulas, sourced direct from the source. Our complete catalogue is coming online shortly — until then, see what our community already loves."
      primaryHref="/#featured-products"
      primaryLabel="See Bestsellers"
    />
  )
}
