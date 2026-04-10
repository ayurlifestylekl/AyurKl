import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Sign In — Coming Soon',
  description:
    'Customer accounts at Kerala Ayurvedic Lifestyle are launching soon.',
  alternates: { canonical: '/auth/login' },
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <ComingSoon
      eyebrow="My Account"
      title="Customer Accounts Are Almost Here."
      subtitle="Our portal for tracking orders and consultations is being built. For now, your booking history lives with our team — just message us anytime."
      primaryHref="https://wa.me/601165043436"
      primaryLabel="Message Us"
    />
  )
}
