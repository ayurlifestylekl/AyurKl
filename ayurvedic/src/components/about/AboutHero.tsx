'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent, EASE_OUT_PREMIUM } from '@/lib/motion'
import { BotanicalMandala } from '@/components/ui/Decorations'

const stats = [
  { id: 'years', value: '17', suffix: '+', label: 'Years of\nKerala practice' },
  { id: 'therapists', value: '08', suffix: '+', label: 'Years per\ntherapist' },
  { id: 'lineage', value: '5K', suffix: '', label: 'Years of\nlineage' },
]

export default function AboutHero() {
  return (
    <section
      aria-labelledby="about-hero-heading"
      className="relative overflow-hidden bg-primary"
    >
      {/* Layered radial atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 75% 20%, rgba(212,163,115,0.18) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(122,157,84,0.14) 0%, transparent 55%)',
        }}
      />

      {/* Grain noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Botanical mandala faint, behind the image side */}
      <div className="pointer-events-none absolute -right-40 top-1/2 hidden h-[640px] w-[640px] -translate-y-1/2 md:block">
        <BotanicalMandala opacity={0.08} />
      </div>

      {/* Section marker — top right */}
      <div className="relative mx-auto max-w-7xl px-6 pt-10 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80">
            <span className="text-white/40">001</span> &nbsp;/&nbsp; Our Story
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 md:inline">
            Brickfields &middot; Kuala Lumpur
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full bg-gradient-to-r from-accent/60 via-white/15 to-transparent"
        />
      </div>

      <motion.div
        variants={staggerParent(0.12, 0.1)}
        initial="initial"
        animate="animate"
        className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-24 lg:grid-cols-12 lg:gap-10 lg:px-12"
      >
        {/* ── LEFT: Editorial headline ─────────────── */}
        <div className="relative flex flex-col gap-7 lg:col-span-7">
          {/* Vertical EST 2008 marker — desktop only */}
          <span
            aria-hidden
            className="absolute -left-12 top-2 hidden font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent/70 lg:block"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Est. &mdash; MMVIII &mdash; 2008
          </span>

          <motion.span
            variants={fadeUp(0)}
            className="inline-flex w-fit items-center gap-3 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            <span aria-hidden className="h-px w-8 bg-accent" />
            A Kerala House of Healing
          </motion.span>

          <motion.h1
            id="about-hero-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[44px] font-extrabold leading-[0.95] tracking-[-0.025em] text-white sm:text-[64px] md:text-[78px] lg:text-[88px]"
          >
            A Sanctuary
            <br />
            for Authentic
            <br />
            <span className="font-body italic font-normal text-accent">
              healing.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp(0)}
            className="max-w-xl font-body text-[16px] leading-[1.75] text-white/75 md:text-[17px]"
          >
            Since 2008, the team at Kerala Ayurvedic Lifestyle has carried the
            timeless wisdom of Kerala&rsquo;s 5,000-year-old healing science to
            Brickfields &mdash; one consultation, one therapy, one body at a
            time.
          </motion.p>

          {/* Stat row — large editorial numerals */}
          <motion.dl
            variants={fadeUp(0)}
            className="mt-6 grid grid-cols-3 gap-4 border-t border-accent/25 pt-7 sm:max-w-md sm:gap-6"
          >
            {stats.map(stat => (
              <div key={stat.id} className="flex flex-col gap-1">
                <dt className="flex items-baseline gap-0.5 font-heading font-extrabold leading-none text-white">
                  <span className="text-[40px] sm:text-[44px]">{stat.value}</span>
                  <span className="text-[20px] text-accent">{stat.suffix}</span>
                </dt>
                <dd className="whitespace-pre-line font-heading text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ── RIGHT: Layered image card ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 1.0, delay: 0.35, ease: EASE_OUT_PREMIUM },
          }}
          className="relative mx-auto w-full max-w-[480px] lg:col-span-5"
        >
          {/* Offset gold frame behind */}
          <div
            aria-hidden
            className="absolute -right-3 -top-3 h-full w-full rounded-[28px] border border-accent/45"
          />

          {/* Vertical caption line */}
          <span
            aria-hidden
            className="absolute -left-6 top-1/2 hidden h-24 w-px -translate-y-1/2 bg-accent/40 lg:block"
          />

          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.7)] ring-1 ring-accent/30">
            <Image
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80"
              alt="The serene treatment room at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
              className="object-cover"
            />
            {/* Color treatment + readability gradient */}
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background:
                  'linear-gradient(180deg, rgba(47,93,80,0.15) 0%, rgba(47,93,80,0.45) 100%)',
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 55%, rgba(15,26,18,0.55) 100%)',
              }}
            />

            {/* Bottom caption inside the image */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-white/85">
                Brickfields &middot; KL
              </span>
              <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
                001
              </span>
            </div>
          </div>

          {/* Floating EST 2008 plate */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.7, delay: 0.95, ease: EASE_OUT_PREMIUM },
            }}
            className="absolute -bottom-6 -left-6 flex items-center gap-4 rounded-2xl bg-white px-5 py-3.5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.5)] ring-1 ring-accent/40"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-heading text-[9px] font-extrabold tracking-wider text-white"
              style={{
                background:
                  'linear-gradient(135deg, #e8b87a 0%, #D4A373 50%, #c4924a 100%)',
              }}
            >
              KAL
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-[8px] font-bold uppercase tracking-[0.22em] text-dark/55">
                Established
              </span>
              <span className="font-heading text-[18px] font-black leading-none text-primary">
                MMVIII
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
