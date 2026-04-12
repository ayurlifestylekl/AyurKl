'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { wellnessFocusAreas } from '@/data/about'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

/**
 * Wellness services — refined vertical list.
 * Consistent icon treatment (no gradient-filled circles).
 */
export default function WellnessFocus() {
  return (
    <section
      aria-labelledby="wellness-heading"
      className="relative bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between lg:mb-14"
        >
          <div>
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
              Wellness Services
            </span>
            <h2
              id="wellness-heading"
              className="mt-3 font-heading text-3xl font-extrabold leading-[1.08] text-primary sm:text-4xl"
            >
              Therapies for Every Stage of Life
            </h2>
          </div>
          <Link
            href="/treatments"
            className="group inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent"
          >
            Explore All Treatments
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Service rows */}
        <motion.div
          variants={staggerParent(0.06, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col"
        >
          {wellnessFocusAreas.map((area, i) => {
            const Icon = area.icon
            const num = String(i + 1).padStart(2, '0')

            return (
              <motion.div key={area.id} variants={fadeUp(0)} className="group">
                {/* Separator */}
                <div
                  className="h-px transition-colors duration-500 group-hover:opacity-80"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(47,93,80,0.15), rgba(47,93,80,0.05), transparent)',
                  }}
                  aria-hidden
                />

                <Link
                  href="/treatments"
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 md:grid-cols-[auto_auto_1fr_auto] md:gap-6 md:py-7"
                >
                  {/* Number */}
                  <span className="font-heading text-[14px] font-semibold text-primary/25 md:text-[16px]">
                    {num}
                  </span>

                  {/* Icon — consistent treatment, no gradient fill */}
                  <div
                    className={`hidden h-9 w-9 items-center justify-center rounded-full md:flex ${
                      area.highlighted
                        ? 'bg-accent/10 ring-1 ring-accent/50'
                        : 'bg-primary/[0.06] ring-1 ring-primary/15'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        area.highlighted ? 'text-accent' : 'text-primary/60'
                      }`}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title */}
                  <span
                    className={`font-heading text-[16px] font-bold transition-transform duration-300 group-hover:translate-x-1 md:text-[20px] ${
                      area.highlighted ? 'text-accent' : 'text-primary'
                    }`}
                  >
                    {area.label}
                    {area.highlighted && (
                      <span className="ml-2 inline-block rounded-sm bg-accent/10 px-2 py-0.5 align-middle font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-accent">
                        Speciality
                      </span>
                    )}
                  </span>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-primary/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </motion.div>
            )
          })}

          {/* Bottom separator */}
          <div
            className="h-px"
            style={{
              background:
                'linear-gradient(to right, rgba(47,93,80,0.15), rgba(47,93,80,0.05), transparent)',
            }}
            aria-hidden
          />
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={fadeUp(0.2)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mt-8 max-w-lg font-body text-[13px] italic text-dark/40"
        >
          We also specialise in supporting working professionals, offering
          Ayurvedic occupational wellness solutions to manage day-to-day stress,
          fatigue, and lifestyle-related concerns.
        </motion.p>
      </div>
    </section>
  )
}
