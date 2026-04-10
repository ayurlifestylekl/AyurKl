import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Book a Consultation',
  description:
    'Book a 30-minute consultation with Vaidya AKHIL HS (B.A.M.S) at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur. Online booking launching soon.',
  alternates: { canonical: '/book' },
}

export default function BookPage() {
  return (
    <ComingSoon
      eyebrow="Book a Consultation"
      title="Online Booking Opens Shortly."
      subtitle="Our self-serve booking flow is being prepared. Until then, message us on WhatsApp and our team will arrange a time with Vaidya AKHIL HS that fits your schedule."
      primaryHref="https://wa.me/601165043436"
      primaryLabel="Book via WhatsApp"
    />
  )
}
