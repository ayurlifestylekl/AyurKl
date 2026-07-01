import HeroSection from '@/components/HeroSection'
import TrustStrip from '@/components/sections/TrustStrip'
import EmpathyBridge from '@/components/sections/EmpathyBridge'
import ClinicTherapies from '@/components/sections/ClinicTherapies'
import PromoBanners from '@/components/sections/PromoBanners'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import VideoTestimonials from '@/components/sections/VideoTestimonials'
import Reviews from '@/components/sections/Reviews'
import FAQs from '@/components/sections/FAQs'
import FinalBookingCTA from '@/components/sections/FinalBookingCTA'
import { COMMERCE_ENABLED } from '@/lib/admin/features'
import { faqs as homeFaqsFallback } from '@/data/faqs'
import { fetchFaqs } from '@/sanity/fetchFaqs'

// Short window so FAQ edits published in Sanity Studio show up within ~30s.
export const revalidate = 30

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
  name: 'Kerala Ayurvedic Lifestyle',
  legalName: 'Ayurvedic Lifestyle (KL) Sdn Bhd',
  description:
    'Authentic Kerala Ayurveda Centre and apothecary in Brickfields, Kuala Lumpur. Serving Malaysia since 2008.',
  url: 'https://keralaayurvediclifestyle.com.my',
  telephone: '+60-11-6504-3436',
  email: 'info@keralaayurvediclifestyle.com.my',
  foundingDate: '2008',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Brickfields',
    addressRegion: 'Kuala Lumpur',
    addressCountry: 'MY',
  },
  founder: {
    '@type': 'Person',
    name: 'our Vaidyas',
    jobTitle: 'B.A.M.S, Ayurvedic Physician',
  },
  priceRange: 'RM45 – RM480',
  areaServed: {
    '@type': 'Country',
    name: 'Malaysia',
  },
  paymentAccepted: 'Cash, Credit Card, Online Banking, Billplz',
  sameAs: [
    'https://www.facebook.com/KeralaAyurvedicLifestyle',
    'https://www.instagram.com/keralaayurvediclifestyle/',
  ],
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

export default async function Home() {
  const homeFaqs = await fetchFaqs('home', homeFaqsFallback)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

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
      {/* Shop sections — archived until the product catalogue launches (Phase 2). */}
      {COMMERCE_ENABLED && (
        <>
          <PromoBanners />
          <FeaturedProducts />
        </>
      )}
      <VideoTestimonials />
      <Reviews />
      <FAQs items={homeFaqs} />
      <FinalBookingCTA />
    </>
  )
}
