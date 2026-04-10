import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Reach Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur. WhatsApp +60 11 6504 3436 or message us to book a consultation with Vaidya AKHIL HS (B.A.M.S).',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <ComingSoon
      eyebrow="Get In Touch"
      title="The Easiest Way To Reach Us Is WhatsApp."
      subtitle="Our full contact page is on the way. For now, message us directly on WhatsApp at +60 11 6504 3436 — our team replies within the hour during clinic hours."
      primaryHref="https://wa.me/601165043436"
      primaryLabel="Message on WhatsApp"
    />
  )
}
