import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import BookingPolicyStrip from '@/components/booking/BookingPolicyStrip'
import ConsultationBooking from '@/components/booking/ConsultationBooking'

export const metadata: Metadata = {
  title: 'Book a Free Consultation — Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu)',
  description:
    'Book a free 30-minute Ayurveda consultation with Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu) at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur. Dosha assessment and personalised protocol.',
  alternates: { canonical: '/book/consultation' },
  openGraph: {
    title: 'Book a Free Consultation — Kerala Ayurvedic Lifestyle',
    description:
      'Complimentary 30-minute consultation with a KKM-registered Kerala Vaidya in Brickfields, Kuala Lumpur.',
    url: 'https://keralaayurvedic.com/book/consultation',
    type: 'website',
  },
}

export default function ConsultationPage() {
  return (
    <>
      <BookingPolicyStrip />

      <section
        aria-labelledby="consultation-page-heading"
        className="relative overflow-hidden bg-cream"
      >
        {/* Layered warm atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 8% 0%, rgba(212, 175, 55,0.14) 0%, transparent 40%), radial-gradient(ellipse at 92% 100%, rgba(30, 91, 75,0.05) 0%, transparent 45%)',
          }}
        />

        <div className="relative mx-auto flex max-w-5xl flex-col px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
          <Link
            href="/book"
            className="group inline-flex w-fit items-center gap-2 font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary/55 transition-colors hover:text-primary focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <ArrowLeft
              className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5"
              strokeWidth={2.2}
            />
            Back to booking
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-[2px] w-10 rounded-full bg-accent"
              />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                Free · 30 minutes
              </span>
            </div>
            <h1
              id="consultation-page-heading"
              className="font-heading font-extrabold leading-[1.05] text-primary"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Meet{' '}
              <span className="font-body font-normal italic text-accent">
                Vaidya Akhil.
              </span>
            </h1>
            <p className="max-w-2xl font-body text-[15px] leading-[1.75] text-dark/65 sm:text-[16px]">
              Pick a time below and we&apos;ll confirm your slot instantly. The
              consultation is complimentary — bring your questions, any
              existing medical notes, and we&apos;ll design a protocol together.
            </p>
          </div>

          <div className="mt-10 lg:mt-12">
            <ConsultationBooking />
          </div>
        </div>
      </section>
    </>
  )
}
