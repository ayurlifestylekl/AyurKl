import type { Metadata } from 'next'

import EnvelopeOpening from '@/components/contact/EnvelopeOpening'
import ConciergeRail from '@/components/contact/ConciergeRail'
import LetterheadDesk from '@/components/contact/LetterheadDesk'
import BrickfieldsAtlas from '@/components/contact/BrickfieldsAtlas'
import LetterPostscript from '@/components/contact/LetterPostscript'
import { contactFaqs } from '@/data/contactFaqs'

export const metadata: Metadata = {
  title: 'Contact — Kerala Ayurvedic Lifestyle, Brickfields KL',
  description:
    'Write to Vaidya AKHIL HS, B.A.M.S. Book a consultation, ask about the Ayur-Store, or visit our Brickfields clinic. Every message read personally; replies within one working day.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — Kerala Ayurvedic Lifestyle',
    description:
      'Begin your healing journey. Message us on WhatsApp, book a consultation, or visit our Brickfields clinic.',
    url: 'https://keralaayurvedic.com/contact',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <>
      <EnvelopeOpening />
      <ConciergeRail />
      <LetterheadDesk />
      <BrickfieldsAtlas />
      <LetterPostscript items={contactFaqs} />
    </>
  )
}
