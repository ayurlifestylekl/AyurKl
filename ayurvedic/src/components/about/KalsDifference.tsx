'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { kalsDifferences } from '@/data/about'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function KalsDifference() {
  return (
    <section
      id="kals-difference"
      aria-labelledby="kals-difference-heading"
      className="relative overflow-hidden bg-background"
    >
      {/* Soft warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 10% 20%, rgba(212,163,115,0.10) 0%, transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(47,93,80,0.07) 0%, transparent 55%)',
        }}
      />

      {/* Section marker */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
            <span className="text-accent">005</span> &nbsp;/&nbsp; The Difference
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 md:inline">
            What separates a clinic from a spa
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
            className="lg:col-span-8"
          >
            <h2
              id="kals-difference-heading"
              className="font-heading text-balance text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em] text-primary sm:text-[48px] md:text-[60px]"
            >
              Why patients stay
              <br />
              with us for{' '}
              <span className="font-body italic font-normal text-accent">
                fifteen years.
              </span>
            </h2>
          </motion.div>
          <motion.p
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            variants={fadeUp(0.1)}
            className="max-w-md font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px] lg:col-span-4"
          >
            Four quiet things separate a real Ayurvedic clinic from a wellness
            spa &mdash; and we will not compromise on any of them.
          </motion.p>
        </div>

        {/* ── Asymmetric bento layout ─────────────── */}
        <motion.ul
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6"
        >
          {kalsDifferences.map((item, idx) => {
            const Icon = item.icon
            // Asymmetric: 0 = wide, 1 = narrow, 2 = narrow, 3 = wide
            const isWide = idx === 0 || idx === 3
            const span = isWide ? 'md:col-span-7' : 'md:col-span-5'
            const num = String(idx + 1).padStart(2, '0')

            return (
              <motion.li
                key={item.id}
                variants={fadeUp(0)}
                className={`${span} flex`}
              >
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="group relative flex flex-1 flex-col gap-5 overflow-hidden rounded-3xl bg-white p-8 shadow-[0_24px_60px_-30px_rgba(47,93,80,0.45)] ring-1 ring-dark/5 transition-all duration-500 hover:shadow-[0_36px_80px_-25px_rgba(47,93,80,0.6)] hover:ring-accent/50 md:p-10"
                >
                  {/* Background numeral */}
                  <span
                    aria-hidden
                    className="absolute -right-2 -top-4 font-heading text-[120px] font-black leading-[0.85] tracking-[-0.04em] text-primary/[0.04] transition-colors duration-500 group-hover:text-accent/15 md:text-[160px]"
                  >
                    {num}
                  </span>

                  {/* Top row: icon + label */}
                  <div className="relative flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                      style={{
                        background:
                          'linear-gradient(135deg, #e8b87a 0%, #D4A373 50%, #c4924a 100%)',
                        boxShadow: '0 8px 24px -10px rgba(212,163,115,0.7)',
                      }}
                    >
                      <Icon
                        className="h-5 w-5 text-white"
                        strokeWidth={2.2}
                        aria-hidden
                      />
                    </div>
                    <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/40">
                      Principle / {num}
                    </span>
                  </div>

                  {/* Title + body */}
                  <div className="relative flex flex-col gap-3">
                    <h3 className="font-heading text-[24px] font-extrabold leading-tight text-primary md:text-[28px]">
                      {item.title}
                    </h3>
                    <p className="max-w-md font-body text-[15px] leading-[1.75] text-dark/70 md:text-[16px]">
                      {item.body}
                    </p>
                  </div>

                  {/* Bottom rule */}
                  <span
                    aria-hidden
                    className="relative mt-auto block h-[2px] w-12 rounded-full bg-accent transition-all duration-500 group-hover:w-24"
                  />
                </motion.article>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
