'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { fadeUp, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'
import { therapies } from '@/data/therapies'

/**
 * Scroll-Spied Sticky Reveal (Luxury Hotel Style)
 * As the user scrolls down the page, the therapies on the left pass through
 * the center of the viewport, automatically triggering the cross-fade of the
 * massive sticky image on the right. Zero clicks required.
 */
export default function ClinicTherapies() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section
      id="clinic-therapies"
      aria-labelledby="therapies-heading"
      className="relative bg-[#f8f6f0] py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20 xl:gap-32">
          
          {/* ── LEFT: Header & Scrollable Therapy List ── */}
          <div className="flex flex-col">
            <motion.div
              variants={fadeUp(0)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="mb-12 lg:mb-32"
            >
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                At The Clinic
              </span>
              <h2
                id="therapies-heading"
                className="mt-4 font-heading text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight text-primary"
              >
                Signature Therapies
              </h2>
              <p className="mt-5 max-w-md font-body text-[16px] leading-relaxed text-dark/60">
                Performed by Vaidya AKHIL HS (B.A.M.S). All treatments are tailored to your dosha, ensuring a deeply restorative and authentic healing experience.
              </p>
            </motion.div>

            {/* Scroll-Spied List */}
            <div className="flex flex-col lg:pb-[30vh]">
              {therapies.map((therapy, i) => {
                const isActive = activeIndex === i
                const numberString = `0${i + 1}`

                return (
                  <motion.div
                    key={therapy.slug}
                    // Trigger when this element enters the middle 20% of the screen
                    onViewportEnter={() => setActiveIndex(i)}
                    viewport={{ margin: "-40% 0px -40% 0px" }}
                    className={`flex flex-col py-10 transition-all duration-700 lg:py-24 ${
                      isActive ? 'lg:opacity-100 lg:translate-x-0' : 'lg:opacity-30 lg:-translate-x-4'
                    }`}
                  >
                    {/* Mobile Image (Hidden on Desktop) */}
                    <div className="relative mb-8 aspect-[4/5] w-full overflow-hidden rounded-sm shadow-xl lg:hidden">
                      <Image
                        src={therapy.image}
                        alt={therapy.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 0vw"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: 'rgba(47,93,80,0.1)' }} />
                    </div>

                    <div className="flex items-center gap-6 lg:gap-8">
                      <span className="font-heading text-xl font-bold text-accent lg:text-2xl">
                        {numberString}
                      </span>
                      <h3 className="font-heading text-3xl font-extrabold tracking-tight text-primary lg:text-[2.75rem]">
                        {therapy.name}
                      </h3>
                    </div>

                    <div className="pl-[44px] pt-4 lg:pl-[64px]">
                      {/* Duration */}
                      <div className="mb-4 flex items-center gap-2 text-accent">
                        <Clock className="h-4 w-4" strokeWidth={1.5} />
                        <span className="font-body text-[13px] italic tracking-wide text-accent/90">
                          {therapy.durationMin} minutes
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="mb-6 max-w-sm font-body text-[17px] leading-relaxed text-dark/70 lg:text-[18px]">
                        {therapy.tagline}
                      </p>

                      {/* Bullets */}
                      <ul className="mb-10 flex flex-col gap-3">
                        {therapy.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-center gap-4 font-body text-[15px] text-dark/60 lg:text-[16px]"
                          >
                            <span className="h-[1px] w-6 flex-shrink-0 bg-accent/40" />
                            {b}
                          </li>
                        ))}
                      </ul>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between border-t border-primary/10 pt-8">
                        <div className="flex items-baseline gap-1">
                          <span className="mb-1 font-body text-[13px] font-medium tracking-widest text-primary/40 uppercase">
                            RM
                          </span>
                          <span className="font-heading text-3xl font-extrabold tracking-tight text-primary lg:text-4xl">
                            {therapy.priceRm}
                          </span>
                        </div>

                        <Link
                          href={`#booking?therapy=${therapy.slug}`}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-accent hover:shadow-[0_10px_30px_rgba(212,163,115,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                          aria-label={`Book ${therapy.name}`}
                        >
                          <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── RIGHT: Sticky Cinematic Portal (Desktop Only) ── */}
          <div className="relative hidden aspect-[4/5] w-full overflow-hidden rounded-sm shadow-2xl lg:sticky lg:top-[12vh] lg:block lg:h-[76vh] lg:max-h-[850px] lg:min-h-[600px] lg:w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: EASE_OUT_PREMIUM }}
                className="absolute inset-0"
              >
                <Image
                  src={therapies[activeIndex].image}
                  alt={`${therapies[activeIndex].name} — ${therapies[activeIndex].tagline}`}
                  fill
                  sizes="(max-width: 1024px) 0vw, 55vw"
                  className="object-cover object-center"
                  priority
                />
                {/* Luxury green tint */}
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: 'rgba(47,93,80,0.15)' }}
                  aria-hidden
                />
                <div className="absolute inset-0 border border-white/10 mix-blend-overlay" />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
