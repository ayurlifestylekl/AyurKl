'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle } from 'lucide-react'
import CTAButton from '@/components/ui/CTAButton'
import { clipReveal, fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

/**
 * Cinematic close — split layout:
 * Left: atmospheric photograph with heavy green tint + grain
 * Right: CTA content on near-black green
 */
export default function FinalBookingCTA() {
  return (
    <section
      id="booking"
      aria-labelledby="booking-heading"
      className="relative overflow-hidden"
    >
      <div className="grid min-h-[60vh] grid-cols-1 lg:grid-cols-[3fr_2fr]">
        {/* ── LEFT: Atmospheric photograph ────────────── */}
        <motion.div
          variants={clipReveal('left', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative hidden min-h-[400px] lg:block"
        >
          <Image
            src="/hero-tray.png"
            alt="Ayurvedic herbs and therapeutic oils"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 0vw"
          />
          {/* Heavy green tint */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.55)' }}
            aria-hidden
          />
          {/* Grain overlay */}
          <div className="grain-overlay-dark absolute inset-0" aria-hidden />
          {/* Right edge gold border */}
          <div
            className="absolute inset-y-0 right-0 w-px"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(212,163,115,0.35), transparent)',
            }}
            aria-hidden
          />
        </motion.div>

        {/* Mobile: image band */}
        <motion.div
          variants={clipReveal('bottom', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative h-[30vh] min-h-[200px] lg:hidden"
        >
          <Image
            src="/hero-tray.png"
            alt="Ayurvedic herbs and oils"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.6)' }}
            aria-hidden
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{
              background: 'linear-gradient(to top, #1a2e26 0%, transparent 100%)',
            }}
            aria-hidden
          />
        </motion.div>

        {/* ── RIGHT: CTA content ─────────────────────── */}
        <div className="relative flex flex-col justify-center bg-nearBlackGreen px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(212,163,115,0.06) 0%, transparent 60%)',
            }}
            aria-hidden
          />

          <motion.div
            variants={staggerParent(0.12, 0.05)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="relative z-10 max-w-md"
          >
            <motion.span
              variants={fadeUp(0)}
              className="inline-block font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent"
            >
              Begin Your Journey
            </motion.span>

            <motion.h2
              id="booking-heading"
              variants={fadeUp(0)}
              className="mt-4 font-heading text-3xl font-extrabold leading-[1.08] text-white sm:text-4xl"
            >
              Your first step toward
              <br />
              <span className="text-accent">lasting wellness.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp(0)}
              className="mt-5 font-body text-[15px] leading-[1.7] text-white/60"
            >
              Book a 30-minute consultation with Vaidya AKHIL HS at our
              Brickfields clinic. We&apos;ll assess your dosha and design a
              protocol you can live with.
            </motion.p>

            {/* CTAs — stacked vertically */}
            <motion.div
              variants={fadeUp(0)}
              className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col"
            >
              <CTAButton
                href="https://cal.com/kerala-ayurvedic"
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
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-heading text-[10px] font-medium uppercase tracking-[0.18em] text-white/30"
            >
              <span>Since 2008</span>
              <span className="h-0.5 w-0.5 rounded-full bg-accent/40" />
              <span>Brickfields, KL</span>
              <span className="h-0.5 w-0.5 rounded-full bg-accent/40" />
              <span>Vaidya AKHIL HS (B.A.M.S)</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
