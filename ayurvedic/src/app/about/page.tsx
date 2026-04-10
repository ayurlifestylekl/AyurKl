import type { Metadata } from 'next'
import AboutHero from '@/components/about/AboutHero'
import FoundersVision from '@/components/about/FoundersVision'
import OurPhilosophy from '@/components/about/OurPhilosophy'
import MedicalAuthority from '@/components/about/MedicalAuthority'
import KalsDifference from '@/components/about/KalsDifference'
import WellnessFocus from '@/components/about/WellnessFocus'
import CommitmentCTA from '@/components/about/CommitmentCTA'
import FAQs from '@/components/sections/FAQs'
import { aboutFaqs } from '@/data/about'

export const metadata: Metadata = {
  title: 'About Us — Authentic Kerala Ayurveda Since 2008',
  description:
    'Meet the team behind Kerala Ayurvedic Lifestyle in Brickfields, KL. Founded in 2008 by Datto Shan, led by Vaidya AKHIL HS (B.A.M.S, 16+ years experience), with KKM-registered therapists from Kerala.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://keralaayurvedic.com/about',
    siteName: 'Kerala Ayurvedic Lifestyle',
    title: 'About Kerala Ayurvedic Lifestyle | Brickfields, KL',
    description:
      'Authentic Kerala Ayurveda since 2008. Led by Vaidya AKHIL HS (B.A.M.S). KKM-registered. Therapists from Kerala.',
    images: [
      {
        url: '/hero-tray.png',
        width: 1200,
        height: 630,
        alt: 'Kerala Ayurvedic Lifestyle — authentic Kerala Ayurveda in Brickfields, KL',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Kerala Ayurvedic Lifestyle | Brickfields, KL',
    description:
      'Authentic Kerala Ayurveda since 2008. Led by Vaidya AKHIL HS (B.A.M.S, 16+ years).',
    images: ['/hero-tray.png'],
  },
}

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: 'https://keralaayurvedic.com/about',
  name: 'About Kerala Ayurvedic Lifestyle',
  description:
    'The story, philosophy and team behind Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Kerala Ayurvedic Lifestyle',
    legalName: 'Ayurvedic Lifestyle (KL) Sdn Bhd',
    url: 'https://keralaayurvedic.com',
    foundingDate: '2008',
    founder: {
      '@type': 'Person',
      name: 'Datto Shan',
      jobTitle: 'Founder',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brickfields',
      addressRegion: 'Kuala Lumpur',
      addressCountry: 'MY',
    },
    telephone: '+60-11-6504-3436',
    email: 'info@keralaayurvedic.com',
  },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Vaidya AKHIL HS',
  honorificPrefix: 'Dr',
  honorificSuffix: 'B.A.M.S',
  jobTitle: 'Ayurvedic Physician',
  description:
    'BAMS-qualified Ayurvedic physician with over 16 years of clinical experience from Kerala. Lead Vaidya at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur.',
  worksFor: {
    '@type': 'MedicalBusiness',
    name: 'Kerala Ayurvedic Lifestyle',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brickfields',
      addressRegion: 'Kuala Lumpur',
      addressCountry: 'MY',
    },
  },
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'National Council of Indian System of Medicine',
  },
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: 'B.A.M.S — Bachelor of Ayurvedic Medicine and Surgery',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Kementerian Kesihatan Malaysia (KKM)',
      },
    },
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <AboutHero />
      <FoundersVision />
      <OurPhilosophy />
      <MedicalAuthority />
      <KalsDifference />
      <WellnessFocus />
      <FAQs
        items={aboutFaqs}
        eyebrow="Common Questions"
        title="What Visitors Often Ask About Us"
        subtitle="A few things to know before your first visit to KALS."
        id="about-faqs"
      />
      <CommitmentCTA />
    </>
  )
}
