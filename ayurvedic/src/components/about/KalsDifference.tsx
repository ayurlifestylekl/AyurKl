'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { kalsDifferences } from '@/data/about'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

/**
 * What makes us different — vertical rule list with gold hairlines.
 * No bento grid, no card frames, no background numerals.
 */
export default function KalsDifference() {
  return (
    <section
      aria-labelledby="difference-heading"
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
            What Makes Us Different
          </span>
          <h2
            id="difference-heading"
            className="mt-3 max-w-lg font-heading text-3xl font-extrabold leading-[1.08] text-primary sm:text-4xl"
          >
            Why our patients stay with us.
          </h2>
        </motion.div>

        {/* Difference rows */}
        <motion.div
          variants={staggerParent(0.08, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col"
        >
          {kalsDifferences.map((item, i) => {
            const Icon = item.icon
            const num = String(i + 1).padStart(2, '0')

            return (
              <motion.div key={item.id} variants={fadeUp(0)} className="group">
                {/* Gold hairline */}
                <div
                  className="h-px"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(212,163,115,0.25), rgba(212,163,115,0.1), transparent)',
                  }}
                  aria-hidden
                />

                <div className="grid grid-cols-1 gap-3 py-7 md:grid-cols-12 md:items-start md:gap-6 md:py-9">
                  {/* Index */}
                  <div className="md:col-span-1">
                    <span className="font-heading text-[14px] font-semibold tracking-[0.05em] text-primary/25">
                      {num}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-2.5 md:col-span-4">
                    <Icon
                      className="h-4 w-4 flex-shrink-0 text-accent"
                      strokeWidth={2}
                    />
                    <h3 className="font-heading text-[18px] font-extrabold text-primary md:text-[20px]">
                      {item.title}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="md:col-span-7">
                    <p className="max-w-lg font-body text-[15px] leading-[1.7] text-dark/55">
                      {item.body}
                    </p>
                    <span
                      className="mt-3 block h-px w-0 bg-accent transition-all duration-500 group-hover:w-12"
                      aria-hidden
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Bottom hairline */}
          <div
            className="h-px"
            style={{
              background:
                'linear-gradient(to right, rgba(212,163,115,0.25), rgba(212,163,115,0.1), transparent)',
            }}
            aria-hidden
          />
        </motion.div>
      </div>
    </section>
  )
}
