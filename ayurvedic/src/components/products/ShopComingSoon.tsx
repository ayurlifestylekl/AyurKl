import ComingSoon from '@/components/ui/ComingSoon'

/** The Apothecary placeholder shown on every shop route while SHOP_OPEN is false. */
export default function ShopComingSoon() {
  return (
    <ComingSoon
      eyebrow="The Apothecary"
      title="Coming Soon"
      subtitle="Our hand-blended Kerala Ayurvedic formulas — herbal oils, churnas and wellness kits — are being prepared with the same care as everything we do. In the meantime, book a consultation to begin your journey."
      primaryHref="/book/consultation"
      primaryLabel="Book a Consultation"
    />
  )
}
