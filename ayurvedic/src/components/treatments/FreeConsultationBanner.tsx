'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

const conditions = [
  'Chronic back pain',
  'Joint stiffness',
  'Sciatica',
  'Skin conditions',
  'Eczema & psoriasis',
  'Gastric issues',
  'Stress & anxiety',
  'Sleep disorders',
  'Migraine & headache',
  'Hair fall',
]

/**
 * "The Invitation" — two-column consultation banner on primary green.
 * Warm gold atmosphere, conditions panel with gold bullets.
 */
export default function FreeConsultationBanner() {
  return (
    <section
      aria-labelledby="free-consult-heading"
      className="relative overflow-hidden rounded-2xl bg-primary"
    >
      {/* Visible warm atmospheric gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 8% 0%, rgba(212,163,115,0.22) 0%, transparent 50%), radial-gradient(ellipse at 92% 100%, rgba(26,46,38,0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 40%, rgba(212,163,115,0.06) 0%, transparent 35%)',
        }}
      />

      {/* Grain */}
      <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        variants={staggerParent(0.1, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative grid grid-cols-1 items-center gap-10 px-8 py-14 sm:px-12 md:py-16 lg:grid-cols-[3fr_2fr] lg:gap-14 lg:px-14 lg:py-20"
      >
        {/* ── LEFT: Editorial content ─────────────── */}
        <div className="flex flex-col gap-5">
          <motion.div variants={fadeUp(0)} className="flex items-center gap-3">
            <span className="h-[2px] w-10 rounded-full bg-accent" aria-hidden />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Free Consultation
            </span>
          </motion.div>

          <motion.h2
            id="free-consult-heading"
            variants={fadeUp(0)}
            className="max-w-lg font-heading font-extrabold leading-[1.05] text-white"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.025em',
            }}
          >
            A free consultation
            <br />
            with a{' '}
            <span className="font-body italic text-accent">Kerala Vaidya.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0)}
            className="max-w-md font-body text-[15px] leading-[1.75] text-white/60"
          >
            We provide free consultations with our KKM-registered Ayurveda
            practitioner from Kerala, who holds a B.A.M.S degree and specialises
            in personalised treatment protocols.
          </motion.p>

          <motion.div
            variants={fadeUp(0)}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35"
          >
            <span>KKM-Registered</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent/60" />
            <span>B.A.M.S Kerala</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent/60" />
            <span>Vaidya AKHIL HS</span>
          </motion.div>

          <motion.div
            variants={fadeUp(0)}
            className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <CTAButton
              href="/book"
              variant="primary"
              size="lg"
              icon={<Calendar className="h-4 w-4" />}
            >
              Book Free Consultation
            </CTAButton>
            <CTAButton
              href="https://wa.me/601165043436?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20Ayurveda%20consultation."
              variant="outlineLight"
              size="lg"
              icon={<MessageCircle className="h-4 w-4" />}
            >
              WhatsApp Us
            </CTAButton>
          </motion.div>
        </div>

        {/* ── RIGHT: Conditions panel ─────────────── */}
        <motion.aside variants={fadeUp(0.1)} className="relative w-full">
          <div className="rounded-xl bg-white/[0.06] p-7 ring-1 ring-white/12 sm:p-8">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
              We treat
            </span>

            <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 font-body text-[13px] leading-[1.5] text-white/80">
              {conditions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <span aria-hidden className="h-px w-5 bg-accent/50" />
              <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                Consultation is always free
              </span>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </section>
  )
}
