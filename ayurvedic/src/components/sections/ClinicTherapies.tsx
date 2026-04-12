'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Check } from 'lucide-react'
import Link from 'next/link'
import { clipReveal, fadeUp, inViewOnce } from '@/lib/motion'
import { therapies } from '@/data/therapies'

/**
 * Editorial alternating rows — each therapy gets a horizontal row:
 * image on one side, text on the other, alternating left-right.
 */
export default function ClinicTherapies() {
  return (
    <section
      id="clinic-therapies"
      aria-labelledby="therapies-heading"
      className="relative bg-cream"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-12 lg:mb-16"
        >
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
            At The Clinic
          </span>
          <h2
            id="therapies-heading"
            className="mt-3 font-heading text-3xl font-extrabold leading-[1.1] text-primary sm:text-4xl"
          >
            Signature Therapies
          </h2>
          <p className="mt-3 max-w-lg font-body text-[14px] leading-relaxed text-dark/50">
            Performed by Vaidya AKHIL HS (B.A.M.S). Same-gender therapists.
            48-hour cancellation policy.
          </p>
        </motion.div>

        {/* Therapy rows */}
        <div className="flex flex-col">
          {therapies.map((therapy, i) => {
            const imageLeft = i % 2 === 0

            return (
              <React.Fragment key={therapy.slug}>
                {/* Gold hairline separator (not before first) */}
                {i > 0 && (
                  <div
                    className="my-10 h-px lg:my-14"
                    style={{
                      background:
                        'linear-gradient(to right, transparent, rgba(212,163,115,0.25), transparent)',
                    }}
                    aria-hidden
                  />
                )}

                <div
                  className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                    !imageLeft ? 'lg:[direction:rtl]' : ''
                  }`}
                >
                  {/* Image */}
                  <motion.div
                    variants={clipReveal(imageLeft ? 'left' : 'right', 0)}
                    initial="initial"
                    whileInView="animate"
                    viewport={inViewOnce}
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl lg:aspect-[3/4] lg:[direction:ltr]"
                  >
                    <Image
                      src={therapy.image}
                      alt={`${therapy.name} — ${therapy.tagline}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                    />
                    {/* Green tint overlay */}
                    <div
                      className="absolute inset-0 mix-blend-multiply"
                      style={{ backgroundColor: 'rgba(47,93,80,0.08)' }}
                      aria-hidden
                    />
                    {/* Bottom gradient */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(15,26,18,0.25) 0%, transparent 40%)',
                      }}
                      aria-hidden
                    />
                  </motion.div>

                  {/* Text */}
                  <motion.div
                    variants={fadeUp(0.15)}
                    initial="initial"
                    whileInView="animate"
                    viewport={inViewOnce}
                    className="flex flex-col lg:[direction:ltr]"
                  >
                    {/* Duration */}
                    <div className="flex items-center gap-1.5 text-dark/40">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      <span className="font-heading text-[11px] font-medium tracking-wide">
                        {therapy.durationMin} min
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="mt-3 font-heading text-2xl font-extrabold text-primary lg:text-[1.75rem]">
                      {therapy.name}
                    </h3>

                    {/* Tagline */}
                    <p className="mt-1.5 font-body text-[15px] italic text-accent/80">
                      {therapy.tagline}
                    </p>

                    {/* Bullets (2 max) */}
                    <ul className="mt-5 flex flex-col gap-2">
                      {therapy.bullets.slice(0, 2).map(b => (
                        <li
                          key={b}
                          className="flex items-start gap-2 font-body text-[14px] text-dark/65"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-secondary"
                            strokeWidth={2.5}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price */}
                    <p className="mt-6 font-heading text-3xl font-extrabold tracking-tight text-primary">
                      RM{therapy.priceRm}
                    </p>

                    {/* CTA link */}
                    <Link
                      href={`#booking?therapy=${therapy.slug}`}
                      className="group mt-4 inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      aria-label={`Book ${therapy.name} therapy`}
                    >
                      Book This Therapy
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
