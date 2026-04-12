import type { Metadata } from 'next'

import ContactHero from '@/components/contact/ContactHero'
import ContactPaths from '@/components/contact/ContactPaths'
import ContactForm from '@/components/contact/ContactForm'
import ContactLocation from '@/components/contact/ContactLocation'
import FAQs from '@/components/sections/FAQs'
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
      <ContactHero />
      <ContactPaths />
      <ContactForm />
      <ContactLocation />
      <FAQs
        items={contactFaqs}
        eyebrow="016  /  Before you reach out"
        title="Answered before you ask"
      />
    </>
  )
}
