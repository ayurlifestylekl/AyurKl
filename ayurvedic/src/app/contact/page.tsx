import type { Metadata } from 'next'

import Threshold from '@/components/contact/Threshold'
import Directory from '@/components/contact/Directory'
import CallingCard from '@/components/contact/CallingCard'
import Letterhead from '@/components/contact/Letterhead'
import Bureau from '@/components/contact/Bureau'
import Footnotes from '@/components/contact/Footnotes'

export const metadata: Metadata = {
  title: 'Contact — Kerala Ayurvedic Lifestyle, Brickfields KL',
  description:
    'Write to Vaidya AKHIL HS, B.A.M.S. Book a consultation, ask about the Ayur-Store, or visit our Brickfields clinic. Every message read personally; replies within one working day.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — Kerala Ayurvedic Lifestyle',
    description:
      'Cross the threshold. Message, call or visit our Brickfields clinic. Every note reaches Vaidya AKHIL directly — no bots, no call-trees.',
    url: 'https://keralaayurvedic.com/contact',
    type: 'website',
  },
}

/**
 * Vol. II — The Correspondence
 * Six-zone Duet: dark Threshold → cream Directory + CallingCard + Letterhead
 * → dark Bureau → cream Footnotes.
 */
export default function ContactPage() {
  return (
    <>
      <Threshold />
      <Directory />
      <CallingCard />
      <Letterhead />
      <Bureau />
      <Footnotes />
    </>
  )
}
