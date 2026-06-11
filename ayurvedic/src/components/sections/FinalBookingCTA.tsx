'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle } from 'lucide-react'
import CTAButton from '@/components/ui/CTAButton'
import { clipReveal, fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

/* ── Palette ── */
const EMERALD       = '#6E1023'
const EMERALD_DEEP  = '#4A0C18'
const SAFFRON       = '#D4AF37'
const SAFFRON_SOFT  = '#D4AF37'

/**
 * Cinematic close — split layout:
 * Left: atmospheric photograph with warm tint + grain (saffron rim)
 * Right: emerald gradient CTA panel with saffron glow
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
            src="/hero-spices.png"
            alt="Ayurvedic herbs and therapeutic oils"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 0vw"
          />
          {/* Warm emerald tint — lighter so the photo breathes */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(110,16,35,0.42)' }}
            aria-hidden
          />
          {/* Saffron warm wash overlay */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-60"
            style={{
              background:
                'radial-gradient(ellipse 60% 70% at 30% 70%, rgba(212, 175, 55,0.30), transparent 65%)',
            }}
            aria-hidden
          />
          {/* Grain overlay */}
          <div className="grain-overlay-dark absolute inset-0" aria-hidden />
          {/* Right edge saffron border */}
          <div
            className="absolute inset-y-0 right-0 w-px"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(212, 175, 55,0.55) 50%, transparent 100%)',
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
            src="/hero-spices.png"
            alt="Ayurvedic herbs and oils"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(110,16,35,0.5)' }}
            aria-hidden
          />
          {/* Bottom fade to emerald */}
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{
              background: `linear-gradient(to top, ${EMERALD} 0%, transparent 100%)`,
            }}
            aria-hidden
          />
        </motion.div>

        {/* ── RIGHT: CTA content ─────────────────────── */}
        <div
          className="relative flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 lg:py-20"
          style={{
            background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DEEP} 100%)`,
          }}
        >
          {/* Saffron radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 15% 10%, rgba(212, 175, 55,0.18), transparent 60%), radial-gradient(ellipse 50% 55% at 90% 95%, rgba(212, 175, 55,0.10), transparent 65%)',
            }}
            aria-hidden
          />

          {/* Subtle grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
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
            {/* Eyebrow with line */}
            <motion.div variants={fadeUp(0)} className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-px w-10"
                style={{ backgroundColor: SAFFRON_SOFT, opacity: 0.7 }}
              />
              <span
                className="font-heading text-[11px] font-bold uppercase tracking-[0.36em]"
                style={{ color: SAFFRON_SOFT }}
              >
                Begin Your Journey
              </span>
            </motion.div>

            {/* Headline — Montserrat + Playfair italic */}
            <motion.h2
              id="booking-heading"
              variants={fadeUp(0)}
              className="mt-5 flex flex-col"
            >
              <span
                className="font-heading font-extrabold text-white"
                style={{
                  fontSize: 'clamp(1.875rem, 3.4vw, 2.5rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.025em',
                }}
              >
                Your first step toward
              </span>
              <span
                className="font-display italic"
                style={{
                  color: SAFFRON,
                  fontSize: 'clamp(2.125rem, 4vw, 3rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.015em',
                  textShadow: '0 3px 22px rgba(212, 175, 55,0.28)',
                }}
              >
                lasting wellness.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp(0)}
              className="mt-6 font-body leading-[1.7] text-white/95"
              style={{ fontSize: 'clamp(15px, 1.1vw, 16px)' }}
            >
              Book a 30-minute consultation with our{' '}
              <span className="font-semibold text-white">certified Vaidyas</span>{' '}
              at our Brickfields clinic. We&apos;ll assess your dosha and design a
              protocol you can live with.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp(0)}
              className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col"
            >
              <CTAButton
                href="/book/consultation"
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

            {/* Trust row — no specific Vaidya name */}
            <motion.div
              variants={fadeUp(0)}
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-white/45"
            >
              <span>Since 2008</span>
              <span
                aria-hidden
                className="h-1 w-1 rotate-45"
                style={{ backgroundColor: SAFFRON, opacity: 0.7 }}
              />
              <span>Brickfields, KL</span>
              <span
                aria-hidden
                className="h-1 w-1 rotate-45"
                style={{ backgroundColor: SAFFRON, opacity: 0.7 }}
              />
              <span>Certified Vaidyas</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
