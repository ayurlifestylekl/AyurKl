'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import { fadeUp, inViewOnce, slideIn, staggerParent } from '@/lib/motion'

const HOURS: Array<{ day: string; time: string }> = [
  { day: 'Mon', time: '9:00 – 19:00' },
  { day: 'Tue', time: '9:00 – 19:00' },
  { day: 'Wed', time: '9:00 – 19:00' },
  { day: 'Thu', time: '9:00 – 19:00' },
  { day: 'Fri', time: '9:00 – 19:00' },
  { day: 'Sat', time: '9:00 – 19:00' },
  { day: 'Sun', time: 'Closed' },
]

// Generated from the place URL provided by the client. Uses the
// coordinates-first iframe format so no Maps API key is required.
// Coordinates: 3.1269091, 101.6812077 — Kerala Ayurvedic Lifestyle,
// 37 Jalan Thamby Abdullah 1, Brickfields.
const MAP_EMBED_URL =
  'https://maps.google.com/maps?q=Kerala+Ayurvedic+Lifestyle,+37+Jalan+Thamby+Abdullah+1,+Brickfields,+Kuala+Lumpur&ll=3.1269091,101.6812077&z=17&hl=en&output=embed'

export default function ContactLocation() {
  return (
    <section
      aria-labelledby="location-heading"
      className="relative overflow-hidden bg-cream"
    >
      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 12% 88%, rgba(212,163,115,0.12) 0%, transparent 55%), radial-gradient(ellipse at 88% 12%, rgba(122,157,84,0.09) 0%, transparent 55%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-32 lg:px-12">
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16"
        >
          {/* LEFT — calling card */}
          <motion.div variants={fadeUp(0)} className="lg:col-span-5">
            <div className="flex flex-col gap-7">
              <div className="flex items-center gap-3">
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/55">
                  015
                </span>
                <span aria-hidden className="h-px w-8 bg-accent/60" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
                  Find us
                </span>
              </div>

              <h2
                id="location-heading"
                className="font-heading text-[44px] font-extrabold leading-[1] tracking-[-0.022em] text-primary md:text-[52px]"
              >
                Visit the
                <br />
                <span className="font-body italic font-normal text-accent">
                  clinic.
                </span>
              </h2>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin
                  className="h-4 w-4 shrink-0 translate-y-1 text-accent"
                  strokeWidth={2.2}
                />
                <address className="font-body text-[17px] not-italic leading-[1.7] text-dark/75">
                  37, Jalan Thamby Abdullah 1,
                  <br />
                  Brickfields, 50470
                  <br />
                  Kuala Lumpur, Wilayah Persekutuan
                </address>
              </div>

              {/* Hours table — printed-menu style with dotted leaders */}
              <div className="rounded-[18px] border border-accent/20 bg-white/60 px-6 py-5 backdrop-blur-sm">
                <span className="mb-3 block font-heading text-[9.5px] font-bold uppercase tracking-[0.3em] text-primary/55">
                  Opening hours
                </span>
                <div className="flex flex-col gap-2">
                  {HOURS.map(({ day, time }) => (
                    <div
                      key={day}
                      className="flex items-baseline gap-3 font-heading text-[11px] font-bold uppercase tracking-[0.15em]"
                    >
                      <span className="w-9 text-primary">{day}</span>
                      <span
                        aria-hidden
                        className="flex-1 translate-y-[-3px] border-b border-dotted border-primary/30"
                      />
                      <span
                        className={
                          time === 'Closed' ? 'text-dark/35' : 'text-primary/75'
                        }
                      >
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct action buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <CTAButton
                  variant="secondary"
                  size="md"
                  icon={<MessageCircle className="h-4 w-4" strokeWidth={2.4} />}
                  href="https://wa.me/601165043436"
                  shimmer
                >
                  Message on WhatsApp
                </CTAButton>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <CTAButton
                    variant="outlineDark"
                    size="md"
                    icon={<Phone className="h-4 w-4" strokeWidth={2.4} />}
                    href="tel:+601165043436"
                    className="sm:flex-1"
                  >
                    Call clinic
                  </CTAButton>
                  <CTAButton
                    variant="outlineDark"
                    size="md"
                    icon={<Mail className="h-4 w-4" strokeWidth={2.4} />}
                    href="mailto:info@keralaayurvedic.com"
                    className="sm:flex-1"
                  >
                    Email us
                  </CTAButton>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — framed map */}
          <motion.div
            variants={slideIn('right', 0.15)}
            className="lg:col-span-7"
          >
            <div className="rounded-[24px] bg-gradient-to-br from-white via-white to-[#FAF6EE] p-3 shadow-floating ring-1 ring-accent/30">
              <div className="relative overflow-hidden rounded-[18px] ring-1 ring-accent/15">
                <div className="aspect-[16/11] w-full">
                  <iframe
                    src={MAP_EMBED_URL}
                    width="100%"
                    height="100%"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Kerala Ayurvedic Lifestyle on Google Maps"
                    className="h-full w-full border-0"
                  />
                </div>
              </div>
              <p className="mt-4 px-2 font-body text-[13px] italic leading-[1.6] text-dark/55">
                A short walk from KL Sentral — the Brickfields temple quarter.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
