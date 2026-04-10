'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { slideIn, fadeUp, inViewOnce, staggerParent } from '@/lib/motion'
import { BotanicalMandala } from '@/components/ui/Decorations'

export default function FoundersVision() {
  return (
    <section
      aria-labelledby="founders-vision-heading"
      className="relative overflow-hidden bg-[#FAF6EE]"
    >
      {/* Paper-warm radial wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.10) 0%, transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(47,93,80,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Section marker strip */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
            <span className="text-accent">002</span> &nbsp;/&nbsp; The Founder
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 md:inline">
            A Letter from Datto Shan
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full bg-gradient-to-r from-accent/50 via-primary/15 to-transparent"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-16 px-6 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-20 lg:grid-cols-12 lg:gap-20 lg:px-12">
        {/* ── LEFT: Founder portrait stack ─────────────── */}
        <motion.div
          variants={slideIn('left', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative mx-auto w-full max-w-[440px] lg:col-span-5 lg:sticky lg:top-28"
        >
          {/* Vertical name plate */}
          <span
            aria-hidden
            className="absolute -left-7 top-3 hidden font-heading text-[9px] font-bold uppercase tracking-[0.4em] text-primary/55 lg:block"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Datto Shan &mdash; Founder
          </span>

          {/* Offset border accent */}
          <div
            aria-hidden
            className="absolute -left-3 -top-3 h-full w-full rounded-[28px] border border-primary/30"
          />

          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_40px_90px_-30px_rgba(47,93,80,0.55)] ring-1 ring-accent/40">
            <Image
              src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1000&q=80"
              alt="Datto Shan, founder of Kerala Ayurvedic Lifestyle"
              fill
              sizes="(max-width: 1024px) 100vw, 35vw"
              className="object-cover"
            />
            {/* Color treatment */}
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background:
                  'linear-gradient(180deg, rgba(212,163,115,0.10) 0%, rgba(47,93,80,0.30) 100%)',
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 55%, rgba(15,26,18,0.45) 100%)',
              }}
            />

            {/* In-image caption */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div className="flex flex-col">
                <span className="font-heading text-[8px] font-bold uppercase tracking-[0.22em] text-white/70">
                  Founder
                </span>
                <span className="font-heading text-[15px] font-extrabold leading-tight text-white">
                  Datto Shan
                </span>
              </div>
              <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
                002
              </span>
            </div>
          </div>

          {/* Decorative mandala — bottom corner */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44"
          >
            <BotanicalMandala opacity={0.5} stroke="#2F5D50" />
          </div>
        </motion.div>

        {/* ── RIGHT: Letter ─────────────── */}
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col gap-8 lg:col-span-7"
        >
          <motion.span
            variants={fadeUp(0)}
            className="inline-flex w-fit items-center gap-3 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            <span aria-hidden className="h-px w-8 bg-accent" />
            A Word from Our Founder
          </motion.span>

          <motion.h2
            id="founders-vision-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em] text-primary sm:text-[48px] md:text-[60px]"
          >
            Bringing Kerala&rsquo;s
            <br />
            healing
            <span className="font-body italic font-normal text-accent">
              {' '}
              home.
            </span>
          </motion.h2>

          {/* Drop-cap paragraph */}
          <motion.div variants={fadeUp(0)} className="max-w-2xl">
            <p className="font-body text-[16px] leading-[1.85] text-dark/80 md:text-[17px]">
              <span className="float-left mr-3 mt-1 font-heading text-[64px] font-black leading-[0.8] text-primary">
                K
              </span>
              erala Ayurvedic Lifestyle was founded with a simple yet powerful
              vision &mdash; to provide genuine Kerala Ayurvedic therapies to
              people in Malaysia without compromise. Inspired by witnessing the
              profound healing experienced by individuals who travelled to
              Kerala, I envisioned creating the same experience closer to home.
            </p>
          </motion.div>

          {/* Pull quote */}
          <motion.blockquote
            variants={fadeUp(0)}
            className="relative max-w-2xl border-l-2 border-accent pl-6"
          >
            <span
              aria-hidden
              className="absolute -left-3 -top-4 font-heading text-[60px] font-black leading-none text-accent/40"
            >
              &ldquo;
            </span>
            <p className="font-body text-[20px] italic leading-[1.5] text-primary md:text-[24px]">
              Bring the therapists, the oils, and the discipline of Kerala
              &mdash; not a softened version of it.
            </p>
          </motion.blockquote>

          <motion.p
            variants={fadeUp(0)}
            className="max-w-2xl font-body text-[16px] leading-[1.85] text-dark/75 md:text-[17px]"
          >
            By bringing skilled therapists and experienced Ayurveda practitioners
            directly from Kerala, we ensure that every therapy reflects the true
            essence of this ancient science.
          </motion.p>

          {/* Signature row */}
          <motion.div
            variants={fadeUp(0)}
            className="mt-4 flex items-end gap-5 border-t border-primary/15 pt-6"
          >
            <div className="flex flex-col gap-1">
              <span
                className="font-body text-[28px] italic leading-none text-primary"
                style={{ fontWeight: 500 }}
              >
                Datto Shan
              </span>
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                Founder &middot; Kerala Ayurvedic Lifestyle
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
