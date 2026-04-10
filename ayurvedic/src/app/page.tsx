import HeroSection from '@/components/HeroSection'
import TrustStrip from '@/components/sections/TrustStrip'
import EmpathyBridge from '@/components/sections/EmpathyBridge'
import ClinicTherapies from '@/components/sections/ClinicTherapies'
import ShopByCategory from '@/components/sections/ShopByCategory'
import PromoBanners from '@/components/sections/PromoBanners'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import Reviews from '@/components/sections/Reviews'
import FAQs from '@/components/sections/FAQs'
import FinalBookingCTA from '@/components/sections/FinalBookingCTA'
import { faqs } from '@/data/faqs'

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
  name: 'Kerala Ayurvedic Lifestyle',
  legalName: 'Ayurvedic Lifestyle (KL) Sdn Bhd',
  description:
    'Authentic Kerala Ayurveda clinic and apothecary in Brickfields, Kuala Lumpur. Serving Malaysia since 2008.',
  url: 'https://keralaayurvedic.com',
  telephone: '+60-11-6504-3436',
  email: 'info@keralaayurvedic.com',
  foundingDate: '2008',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Brickfields',
    addressRegion: 'Kuala Lumpur',
    addressCountry: 'MY',
  },
  founder: {
    '@type': 'Person',
    name: 'Vaidya AKHIL HS',
    jobTitle: 'B.A.M.S, Ayurvedic Physician',
  },
  priceRange: 'RM45 – RM480',
  areaServed: {
    '@type': 'Country',
    name: 'Malaysia',
  },
  paymentAccepted: 'Cash, Credit Card, Online Banking, Billplz',
  sameAs: [],
}

const reviewJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Kerala Ayurvedic Lifestyle',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '150',
    bestRating: '5',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <HeroSection />
      <TrustStrip />
      <EmpathyBridge />
      <ClinicTherapies />
      <ShopByCategory />
      <PromoBanners />
      <FeaturedProducts />
      <Reviews />
      <FAQs />
      <FinalBookingCTA />
    </>
  )
}
