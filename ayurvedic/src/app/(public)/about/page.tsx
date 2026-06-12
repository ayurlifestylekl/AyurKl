import type { Metadata } from 'next'
import AboutHero from '@/components/about/AboutHero'
import FoundersVision from '@/components/about/FoundersVision'
import OurPhilosophy from '@/components/about/OurPhilosophy'
import TeamOrgChart from '@/components/about/TeamOrgChart'
import KalsDifference from '@/components/about/KalsDifference'
import WellnessFocus from '@/components/about/WellnessFocus'
import CommitmentCTA from '@/components/about/CommitmentCTA'
import FAQs from '@/components/sections/FAQs'
import { aboutFaqs as aboutFaqsFallback } from '@/data/about'
import { fetchAboutPage } from '@/sanity/fetchAboutPage'

// Short window so edits to About copy / FAQs published in Sanity Studio
// show up on the live site within ~30s.
export const revalidate = 30

export const metadata: Metadata = {
  title: 'About Us — Authentic Kerala Ayurveda Since 2008',
  description:
    "Meet the team behind Kerala Ayurvedic Lifestyle in Brickfields, KL. Founded in 2008 by Dato' Dr. V.Shanmughanathan, led by our Vaidyas — 16+ years clinical experience — with KKM-registered therapists from Kerala.",
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://keralaayurvediclifestyle.com.my/about',
    siteName: 'Kerala Ayurvedic Lifestyle',
    title: 'About Kerala Ayurvedic Lifestyle | Brickfields, KL',
    description:
      'Authentic Kerala Ayurveda since 2008. Led by our Vaidyas. KKM-registered. Therapists from Kerala.',
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
      'Authentic Kerala Ayurveda since 2008. Led by our Vaidyas — 16+ years.',
    images: ['/hero-tray.png'],
  },
}

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: 'https://keralaayurvediclifestyle.com.my/about',
  name: 'About Kerala Ayurvedic Lifestyle',
  description:
    'The story, philosophy and team behind Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Kerala Ayurvedic Lifestyle',
    legalName: 'Ayurvedic Lifestyle (KL) Sdn Bhd',
    url: 'https://keralaayurvediclifestyle.com.my',
    foundingDate: '2008',
    founder: {
      '@type': 'Person',
      name: "Dato' Dr. V.Shanmughanathan",
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
  name: 'our Vaidyas',
  honorificPrefix: 'Vaidya',
  honorificSuffix: 'B.A.M.S., M.D. (Ayu)',
  jobTitle: 'Ayurvedic Physician',
  description:
    'B.A.M.S. and M.D. (Ayurveda) qualified physician with over 16 years of clinical experience from Kerala. Lead Vaidya at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur — recognised under Malaysia’s Ministry of Health (KKM) as a Traditional & Complementary Medicine (T&CM) Ayurveda Practitioner.',
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
      credentialCategory: 'degree',
      name: 'M.D. (Ayurveda)',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      name: 'Traditional & Complementary Medicine (T&CM) Ayurveda Practitioner',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Kementerian Kesihatan Malaysia (KKM)',
      },
    },
  ],
}

export default async function AboutPage() {
  // About FAQs are sourced from the local fallback until Sanity is republished
  // (the CMS singleton currently has the old "Datto Shan" / present-tense
  // answer for the Kerala-therapists question, which conflicts with the
  // handover narrative).
  const about = await fetchAboutPage()
  const aboutFaqs = aboutFaqsFallback

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
      <AboutHero
        eyebrow={about?.heroEyebrow}
        headlineLead={about?.heroHeadlineLead}
        headlineAccent={about?.heroHeadlineAccent}
        subheading={about?.heroSubheading}
        stats={about?.heroStats}
      />
      {/*
        Founder copy is intentionally driven by the component's defaults until
        the Sanity About singleton is republished with the new copy
        (founder name "Dato' Dr. V.Shanmughanathan", handover narrative).
        Restore the prop bindings below once the CMS document is updated.
      */}
      <FoundersVision />
      {/* Gold hairline: cream → white transition */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212, 175, 55,0.2), transparent)' }}
        aria-hidden
      />
      <OurPhilosophy />
      <TeamOrgChart />
      <KalsDifference />
      <WellnessFocus />
      {/* Gold hairline: dark atelier \u2192 cream FAQ transition */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212, 175, 55,0.3), transparent)' }}
        aria-hidden
      />
      <FAQs
        items={aboutFaqs}
        eyebrow="Common Questions"
        title="What Visitors Often Ask About Us"
        subtitle="A few things to know before your first visit to KALS."
        id="about-faqs"
      />
      <CommitmentCTA
        eyebrow={about?.commitmentEyebrow}
        // headlineLead/headlineAccent driven by component defaults until
        // Sanity is republished ("Your Partner in Health.")
        body={about?.commitmentBody}
        closingLine={about?.commitmentClosingLine}
        primaryLabel={about?.commitmentPrimaryLabel}
        primaryHref={about?.commitmentPrimaryHref}
        secondaryLabel={about?.commitmentSecondaryLabel}
        secondaryHref={about?.commitmentSecondaryHref}
        // trustPills driven by component defaults until Sanity is republished
        // (CMS still has the old "Vaidya AKHIL HS (B.A.M.S)" credential chip).
      />
    </>
  )
}
