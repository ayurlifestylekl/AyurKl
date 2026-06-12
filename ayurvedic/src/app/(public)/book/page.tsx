import type { Metadata } from 'next'

import BookingChooser from '@/components/booking/BookingChooser'

export const metadata: Metadata = {
  title: 'Book with Kerala Ayurvedic Lifestyle',
  description:
    "Choose between a free 30-minute consultation with our Vaidyas or book a specific Kerala Ayurveda treatment at our Brickfields, Kuala Lumpur Centre.",
  alternates: { canonical: '/book' },
  openGraph: {
    title: 'Book with Kerala Ayurvedic Lifestyle',
    description:
      'Free consultation or direct treatment booking with a KKM-registered Kerala Vaidya in Brickfields, Kuala Lumpur.',
    url: 'https://keralaayurvediclifestyle.com.my/book',
    type: 'website',
  },
}

export default function BookPage() {
  return <BookingChooser />
}
