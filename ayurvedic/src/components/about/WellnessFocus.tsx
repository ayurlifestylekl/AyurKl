'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { wellnessFocusAreas } from '@/data/about'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function WellnessFocus() {
  return (
    <section
      id="wellness-focus"
      aria-labelledby="wellness-focus-heading"
      className="relative overflow-hidden bg-[#FAF6EE]"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 0%, rgba(212,163,115,0.10) 0%, transparent 50%), radial-gradient(ellipse at 5% 100%, rgba(122,157,84,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Section marker */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
            <span className="text-accent">006</span> &nbsp;/&nbsp; What We Treat
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 md:inline">
            From childhood to elder care
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full bg-gradient-to-r from-accent/50 via-primary/15 to-transparent"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-20 lg:px-12">
        {/* ── Editorial header ─────────────── */}
        <div className="mb-16 grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            variants={fadeUp(0)}
            className="lg:col-span-7"
          >
            <h2
              id="wellness-focus-heading"
              className="font-heading text-balance text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em] text-primary sm:text-[48px] md:text-[60px]"
            >
              Wellness, tailored to
              <br />
              <span className="font-body italic font-normal text-accent">
                every stage
              </span>{' '}
              of life.
            </h2>
          </motion.div>
          <motion.p
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            variants={fadeUp(0.1)}
            className="max-w-md font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px] lg:col-span-5"
          >
            From a child&rsquo;s first wellness visit to elder care, our
            protocols meet you where you are. Eight specialities &mdash; one
            personal assessment with the Vaidya at the start.
          </motion.p>
        </div>

        {/* ── Editorial list of specialities ─────────────── */}
        <motion.ul
          variants={staggerParent(0.06, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="border-t border-primary/15"
        >
          {wellnessFocusAreas.map((area, idx) => {
            const Icon = area.icon
            const num = String(idx + 1).padStart(2, '0')

            return (
              <motion.li key={area.id} variants={fadeUp(0)}>
                <Link
                  href="#"
                  className={`group relative grid grid-cols-12 items-center gap-4 border-b border-primary/15 py-6 transition-colors duration-500 hover:border-accent/60 md:gap-6 md:py-8 ${
                    area.highlighted ? 'bg-accent/[0.04]' : ''
                  }`}
                >
                  {/* Numeral */}
                  <span
                    aria-hidden
                    className="col-span-2 font-heading text-[18px] font-bold leading-none tracking-[0.05em] text-primary/30 transition-colors duration-500 group-hover:text-accent sm:col-span-1 md:text-[20px]"
                  >
                    {num}
                  </span>

                  {/* Icon */}
                  <span className="col-span-2 flex justify-start sm:col-span-1">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110 ${
                        area.highlighted
                          ? 'ring-1 ring-accent/60'
                          : 'ring-1 ring-primary/20 group-hover:ring-accent/60'
                      }`}
                      style={
                        area.highlighted
                          ? {
                              background:
                                'linear-gradient(135deg, #e8b87a 0%, #D4A373 50%, #c4924a 100%)',
                            }
                          : { background: 'rgba(47,93,80,0.06)' }
                      }
                    >
                      <Icon
                        className={`h-4 w-4 transition-colors duration-500 ${
                          area.highlighted
                            ? 'text-white'
                            : 'text-primary group-hover:text-accent'
                        }`}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                  </span>

                  {/* Title — responds to hover with color shift */}
                  <span className="col-span-7 font-heading text-[18px] font-bold leading-tight text-primary transition-all duration-500 group-hover:translate-x-1 group-hover:text-primary/95 sm:col-span-9 md:text-[24px]">
                    {area.label}
                    {area.highlighted && (
                      <span className="ml-3 hidden align-middle font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent md:inline">
                        &mdash; Speciality
                      </span>
                    )}
                  </span>

                  {/* Arrow */}
                  <span className="col-span-1 flex justify-end">
                    <ArrowRight
                      className="h-4 w-4 text-primary/30 transition-all duration-500 group-hover:translate-x-2 group-hover:text-accent"
                      aria-hidden
                    />
                  </span>
                </Link>
              </motion.li>
            )
          })}
        </motion.ul>

        {/* Footer line */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          variants={fadeUp(0.1)}
          className="mt-12 flex flex-col items-start gap-3"
        >
          <p className="max-w-xl font-body text-[14px] italic text-dark/60">
            Looking for something specific? Every protocol begins with a
            personal assessment with the Vaidya.
          </p>
          <Link
            href="#"
            className="group inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent"
          >
            Explore All Treatments
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
