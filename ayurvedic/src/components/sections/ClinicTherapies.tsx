'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Clock } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import CTAButton from '@/components/ui/CTAButton'
import { therapies } from '@/data/therapies'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function ClinicTherapies() {
  return (
    <SectionWrapper
      id="clinic-therapies"
      eyebrow="At The Clinic"
      title="Signature Ayurvedic Therapies in Brickfields, KL"
      subtitle="Performed in person by Vaidya AKHIL HS (B.A.M.S). Same-gender therapists. 48-hour cancellation policy."
      className="bg-background"
    >
      <p className="-mt-10 mb-12 text-center font-body text-[12px] italic text-dark/45">
        Therapies are strictly same-gender. Advance payments are non-refundable.
      </p>

      <motion.div
        variants={staggerParent(0.12, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
      >
        {therapies.map(therapy => (
          <motion.article
            key={therapy.slug}
            variants={fadeUp(0)}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-25px_rgba(47,93,80,0.35)] ring-1 ring-dark/5 transition-shadow duration-500 hover:shadow-[0_30px_70px_-25px_rgba(47,93,80,0.5)]"
          >
            {/* Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Image
                  src={therapy.image}
                  alt={`${therapy.name} — ${therapy.tagline}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </motion.div>
              {/* Bottom fade */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(15,26,18,0.6) 0%, transparent 45%)',
                }}
              />
              {/* Duration pill */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 backdrop-blur">
                <Clock className="h-3 w-3 text-primary" strokeWidth={2.5} />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  {therapy.durationMin} min
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-4 p-7">
              <div>
                <h3 className="font-heading text-2xl font-extrabold text-primary">
                  {therapy.name}
                </h3>
                <p className="mt-1 font-body text-[14px] italic text-dark/60">
                  {therapy.tagline}
                </p>
              </div>

              {/* Gold accent bar — widens on hover */}
              <span
                aria-hidden
                className="block h-[3px] w-10 rounded-full bg-accent transition-all duration-500 group-hover:w-20"
              />

              {/* Bullets */}
              <ul className="flex flex-col gap-2.5">
                {therapy.bullets.map(b => (
                  <li
                    key={b}
                    className="flex items-start gap-2.5 font-body text-[14px] text-dark/75"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary"
                      strokeWidth={2.5}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-dark/50">
                    From
                  </span>
                  <p className="font-heading text-2xl font-black text-primary">
                    RM{therapy.priceRm}
                  </p>
                </div>
                <CTAButton
                  href={`#booking?therapy=${therapy.slug}`}
                  variant="primary"
                  size="md"
                  ariaLabel={`Book ${therapy.name} therapy`}
                >
                  Book
                </CTAButton>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
