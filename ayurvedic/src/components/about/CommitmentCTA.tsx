'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle } from 'lucide-react'
import CTAButton from '@/components/ui/CTAButton'
import { BotanicalMandala } from '@/components/ui/Decorations'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function CommitmentCTA() {
  return (
    <section
      aria-labelledby="commitment-heading"
      className="relative overflow-hidden bg-primary"
    >
      {/* Atmospheric gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(212,163,115,0.22) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(122,157,84,0.12) 0%, transparent 55%)',
        }}
      />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Mandalas */}
      <div className="pointer-events-none absolute -left-32 top-12 hidden h-[480px] w-[480px] md:block">
        <BotanicalMandala opacity={0.07} />
      </div>
      <div className="pointer-events-none absolute -right-32 bottom-12 hidden h-[520px] w-[520px] md:block">
        <BotanicalMandala opacity={0.06} />
      </div>

      {/* Section marker */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80">
            <span className="text-white/40">007</span> &nbsp;/&nbsp; The Commitment
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 md:inline">
            Closing
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full bg-gradient-to-r from-accent/60 via-white/15 to-transparent"
        />
      </div>

      <motion.div
        variants={staggerParent(0.12, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-20 sm:px-8 md:pb-32 md:pt-28 lg:grid-cols-12 lg:gap-12 lg:px-12"
      >
        {/* ── LEFT: Headline ─────────────── */}
        <div className="flex flex-col gap-7 lg:col-span-7">
          <motion.span
            variants={fadeUp(0)}
            className="inline-flex w-fit items-center gap-3 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            <span aria-hidden className="h-px w-8 bg-accent" />
            Our Commitment to You
          </motion.span>

          <motion.h2
            id="commitment-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[40px] font-extrabold leading-[0.95] tracking-[-0.025em] text-white sm:text-[56px] md:text-[72px]"
          >
            Fifteen years
            <br />
            of partnership
            <br />
            <span className="font-body italic font-normal text-accent">
              in healing.
            </span>
          </motion.h2>

          <motion.div
            variants={fadeUp(0)}
            className="max-w-xl space-y-4 font-body text-[16px] leading-[1.85] text-white/75 md:text-[17px]"
          >
            <p>
              For over 15 years, KALS has been a trusted name in holistic
              healing. We aren&rsquo;t just a clinic &mdash; we are your
              partners in health.
            </p>
            <p>
              Our mission has remained the same since the day we opened: to
              help you rediscover balance and vitality through integrity,
              compassion, and excellence.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeUp(0)}
            className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <CTAButton
              href="/#booking"
              variant="primary"
              size="lg"
              icon={<Calendar className="h-4 w-4" />}
            >
              Book a Consultation
            </CTAButton>
            <CTAButton
              href="https://wa.me/601165043436"
              variant="outlineLight"
              size="lg"
              icon={<MessageCircle className="h-4 w-4" />}
            >
              WhatsApp Us
            </CTAButton>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={fadeUp(0)}
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55"
          >
            <span>Since 2008</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent/70" />
            <span>Brickfields, KL</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent/70" />
            <span>Vaidya AKHIL HS &middot; B.A.M.S</span>
          </motion.div>
        </div>

        {/* ── RIGHT: Pull quote card ─────────────── */}
        <motion.aside
          variants={fadeUp(0.1)}
          className="relative mx-auto w-full max-w-md lg:col-span-5"
        >
          {/* Offset frame */}
          <div
            aria-hidden
            className="absolute -right-3 -top-3 h-full w-full rounded-[28px] border border-accent/45"
          />

          <div className="relative rounded-[28px] bg-white/[0.04] p-10 ring-1 ring-white/10 backdrop-blur-sm">
            {/* Decorative oversized quote mark */}
            <span
              aria-hidden
              className="absolute -left-2 -top-6 font-heading text-[140px] font-black leading-none text-accent/30"
            >
              &ldquo;
            </span>

            <div className="relative flex flex-col gap-7">
              <p className="font-body text-[24px] italic leading-[1.4] text-white md:text-[28px]">
                Experience the difference
                <br />
                that{' '}
                <span className="text-accent">true Ayurveda</span>
                <br />
                makes.
              </p>

              <div className="flex items-center gap-3 border-t border-white/15 pt-5">
                <span aria-hidden className="h-px w-6 bg-accent" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                  KALS Promise &middot; Est. 2008
                </span>
              </div>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </section>
  )
}
