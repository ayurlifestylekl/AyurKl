'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { philosophyPillars } from '@/data/about'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function OurPhilosophy() {
  return (
    <section
      id="our-philosophy"
      aria-labelledby="philosophy-heading"
      className="relative overflow-hidden bg-background"
    >
      {/* Soft sage atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 10%, rgba(122,157,84,0.10) 0%, transparent 50%), radial-gradient(ellipse at 5% 90%, rgba(212,163,115,0.10) 0%, transparent 50%)',
        }}
      />

      {/* Section marker */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
            <span className="text-accent">003</span> &nbsp;/&nbsp; Philosophy
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 md:inline">
            Three guiding principles
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full bg-gradient-to-r from-accent/50 via-primary/15 to-transparent"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-20 lg:px-12">
        {/* ── Editorial header ─────────────── */}
        <div className="mb-20 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            variants={fadeUp(0)}
            className="lg:col-span-7"
          >
            <h2
              id="philosophy-heading"
              className="font-heading text-balance text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em] text-primary sm:text-[48px] md:text-[60px]"
            >
              Body. Mind.
              <br />
              <span className="font-body italic font-normal text-accent">
                Spirit
              </span>{' '}
              &mdash; as one.
            </h2>
          </motion.div>

          <motion.p
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            variants={fadeUp(0.1)}
            className="max-w-md font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px] lg:col-span-5"
          >
            We follow a holistic and wellness-focused approach to Ayurveda
            &mdash; one that treats the whole person, not just the symptom. Our
            practice rests on three principles we will not compromise.
          </motion.p>
        </div>

        {/* ── Numbered principle rows ─────────────── */}
        <motion.ol
          variants={staggerParent(0.12, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col"
        >
          {philosophyPillars.map((pillar, idx) => {
            const Icon = pillar.icon
            const num = String(idx + 1).padStart(2, '0')
            return (
              <motion.li
                key={pillar.id}
                variants={fadeUp(0)}
                className="group relative grid grid-cols-12 items-start gap-4 border-t border-primary/15 py-10 transition-colors duration-500 hover:border-accent/60 md:gap-8 md:py-14"
              >
                {/* Massive numeral */}
                <div className="col-span-3 sm:col-span-2">
                  <span
                    className="font-heading text-[56px] font-black leading-[0.85] tracking-[-0.04em] text-primary/15 transition-colors duration-500 group-hover:text-accent/80 sm:text-[80px] md:text-[110px]"
                    aria-hidden
                  >
                    {num}
                  </span>
                </div>

                {/* Icon — small, restrained */}
                <div className="col-span-9 flex flex-col gap-3 sm:col-span-4 md:col-span-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 ring-1 ring-accent/40 transition-all duration-500 group-hover:bg-primary/15 group-hover:ring-accent">
                    <Icon
                      className="h-5 w-5 text-accent"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-heading text-[24px] font-extrabold leading-tight text-primary md:text-[30px]">
                    {pillar.title}
                  </h3>
                </div>

                {/* Body */}
                <div className="col-span-12 sm:col-span-6 md:col-span-7">
                  <p className="max-w-md font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px]">
                    {pillar.body}
                  </p>
                  {/* Animated rule */}
                  <span
                    aria-hidden
                    className="mt-6 block h-px w-12 bg-accent transition-all duration-500 group-hover:w-32"
                  />
                </div>
              </motion.li>
            )
          })}
          {/* Closing line */}
          <li
            aria-hidden
            className="border-t border-primary/15"
          />
        </motion.ol>
      </div>
    </section>
  )
}
