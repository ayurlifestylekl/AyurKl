import type { Metadata } from 'next'

import Threshold from '@/components/contact/Threshold'
import Directory from '@/components/contact/Directory'
import CallingCard from '@/components/contact/CallingCard'
import Letterhead from '@/components/contact/Letterhead'
import Bureau from '@/components/contact/Bureau'
import Footnotes from '@/components/contact/Footnotes'
import { contactFaqs as contactFaqsFallback } from '@/data/contactFaqs'
import { fetchFaqs } from '@/sanity/fetchFaqs'

// Short window so FAQ edits published in Sanity Studio show up within ~30s.
export const revalidate = 30

export const metadata: Metadata = {
  title: 'Contact — Kerala Ayurvedic Lifestyle, Brickfields KL',
  description:
    'Write to Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu). Book a consultation, ask about the Ayur-Store, or visit our Brickfields Centre. Every message read personally; replies within one working day.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — Kerala Ayurvedic Lifestyle',
    description:
      'Cross the threshold. Message, call or visit our Brickfields Centre. Every note reaches Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu) directly — no bots, no call-trees.',
    url: 'https://keralaayurvedic.com/contact',
    type: 'website',
  },
}

/**
 * Vol. II — The Correspondence
 * Six-zone Duet: dark Threshold → cream Directory + CallingCard + Letterhead
 * → dark Bureau → cream Footnotes.
 */
export default async function ContactPage() {
  const contactFaqs = await fetchFaqs('contact', contactFaqsFallback)

  return (
    <>
      <Threshold />
      <Directory />
      <CallingCard />
      <Letterhead />
      <Bureau />
      <Footnotes items={contactFaqs} />
    </>
  )
}
