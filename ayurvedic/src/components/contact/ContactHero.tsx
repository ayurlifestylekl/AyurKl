'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import { fadeUp, staggerParent, slideIn } from '@/lib/motion'
import CTAButton from '@/components/ui/CTAButton'

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/**
 * Editorial 7/5 split hero. Copy left, Vaidya calling card right.
 * No centered "Contact Us" cliche — reads like a correspondence page.
 */
export default function ContactHero() {
  return (
    <section
      aria-labelledby="contact-hero-heading"
      className="relative overflow-hidden bg-[#FAF6EE]"
    >
      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 8% 12%, rgba(212,163,115,0.14) 0%, transparent 55%), radial-gradient(ellipse at 92% 88%, rgba(122,157,84,0.11) 0%, transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: NOISE_SVG }}
      />
      <div className="pointer-events-none absolute -left-32 top-24 hidden h-[440px] w-[440px] md:block">
        <BotanicalMandala opacity={0.12} />
      </div>
      <div className="pointer-events-none absolute -right-32 bottom-20 hidden h-[460px] w-[460px] md:block">
        <BotanicalMandala opacity={0.1} />
      </div>
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{
          left: '6%',
          top: '18%',
          width: 36,
          height: 48,
          transform: 'rotate(-22deg)',
        }}
        opacity={0.18}
      />
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{
          right: '8%',
          top: '10%',
          width: 42,
          height: 56,
          transform: 'rotate(18deg)',
        }}
        opacity={0.15}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 sm:px-8 md:pb-28 md:pt-32 lg:px-12 lg:pt-36">
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14"
        >
          {/* LEFT — editorial copy */}
          <div className="flex flex-col gap-7 lg:col-span-7">
            {/* Section marker */}
            <motion.div variants={fadeUp(0)} className="flex items-center gap-3">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/55">
                012
              </span>
              <span aria-hidden className="h-px w-8 bg-accent/60" />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
                The First Step
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              id="contact-hero-heading"
              variants={fadeUp(0)}
              className="font-heading text-[50px] font-extrabold leading-[0.98] tracking-[-0.025em] text-primary sm:text-[64px] md:text-[78px]"
            >
              Begin your healing
              <br />
              <span className="font-body italic font-normal text-accent">
                journey.
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              variants={fadeUp(0)}
              className="max-w-xl font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px]"
            >
              Whether you have questions about our treatments, need help with
              the Ayur-Store, or want to book a consultation — we are here for
              you. Every message is read personally, not routed through a bot.
            </motion.p>

            {/* Stat row */}
            <motion.div
              variants={fadeUp(0)}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-3"
            >
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">
                Mon – Sat · 9 AM – 7 PM
              </span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">
                Brickfields, KL
              </span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">
                ~1 Working-Day Reply
              </span>
            </motion.div>
          </div>

          {/* RIGHT — calling card */}
          <motion.div
            variants={slideIn('right', 0.15)}
            className="lg:col-span-5"
          >
            <CallingCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function CallingCard() {
  return (
    <div className="group relative overflow-hidden rounded-[24px] bg-gradient-to-br from-white via-white to-[#FAF6EE] shadow-floating ring-1 ring-accent/30">
      {/* Frame-in-frame letterpress margin */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[12px] z-[3] rounded-[14px] border border-accent/15"
      />

      <div className="relative z-[2] flex flex-col items-start gap-5 p-8 sm:p-10">
        {/* Small-caps label */}
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
          <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.3em] text-primary/55">
            Your correspondent
          </span>
        </div>

        {/* Portrait monogram (swap for real photo later) */}
        <PortraitMonogram />

        {/* Name */}
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-[22px] font-extrabold leading-[1.1] tracking-[-0.01em] text-primary">
            Vaidya AKHIL HS,{' '}
            <span className="font-body italic font-normal text-primary/80">
              B.A.M.S
            </span>
          </h3>
          <p className="font-body text-[14px] italic leading-[1.6] text-dark/65">
            Resident practitioner · Kerala Ayurvedic Lifestyle
          </p>
        </div>

        {/* Gold hairline (expands on card hover) */}
        <span
          aria-hidden
          className="h-px w-12 bg-accent transition-[width] duration-700 ease-out group-hover:w-24"
        />

        {/* Direct WhatsApp CTA */}
        <CTAButton
          variant="primary"
          size="md"
          icon={<MessageCircle className="h-4 w-4" strokeWidth={2.4} />}
          href="https://wa.me/601165043436?text=Hello%2C%20I%20would%20like%20to%20book%20a%20consultation"
          shimmer
        >
          Message on WhatsApp
        </CTAButton>
      </div>
    </div>
  )
}

function PortraitMonogram() {
  return (
    <div className="relative flex h-36 w-full items-center justify-center rounded-[16px] bg-gradient-to-br from-primary/12 via-primary/6 to-accent/12 ring-1 ring-accent/25">
      {/* Corner hairlines — calling-card flourish */}
      <span
        aria-hidden
        className="absolute left-3 top-3 h-5 w-5 border-l border-t border-accent/50"
      />
      <span
        aria-hidden
        className="absolute right-3 top-3 h-5 w-5 border-r border-t border-accent/50"
      />
      <span
        aria-hidden
        className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-accent/50"
      />
      <span
        aria-hidden
        className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-accent/50"
      />

      {/* Monogram disc */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/60 bg-white/80 shadow-[0_12px_28px_-12px_rgba(47,93,80,0.35)] backdrop-blur-sm">
        <span className="font-heading text-[26px] font-extrabold tracking-tight text-primary">
          AH
        </span>
      </div>
    </div>
  )
}
