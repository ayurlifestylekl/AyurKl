'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { clipReveal, fadeUp, slideIn, staggerParent, inViewOnce } from '@/lib/motion'

const credentials = [
  { label: 'Qualification', value: 'B.A.M.S — Bachelor of Ayurvedic Medicine & Surgery' },
  { label: 'Registered With', value: 'National Council of Indian System of Medicine' },
  { label: 'Recognised In', value: 'Malaysia under KKM (Kementerian Kesihatan Malaysia)' },
]

/**
 * Medical authority — cinematic split.
 * Left: credentials on nearBlackGreen. Right: full-bleed photograph.
 * No floating cards, no bobbing animations, no gradient icon circles.
 */
export default function MedicalAuthority() {
  return (
    <section
      aria-labelledby="authority-heading"
      className="relative overflow-hidden"
    >
      <div className="grid min-h-[85vh] grid-cols-1 lg:grid-cols-[3fr_2fr]">
        {/* ── LEFT: Credentials panel ─────────────────── */}
        <motion.div
          variants={slideIn('left', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative flex flex-col justify-center bg-nearBlackGreen px-6 py-16 sm:px-10 lg:px-14 lg:py-20"
        >
          {/* Grain */}
          <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />

          {/* Subtle glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 40% 60%, rgba(212,163,115,0.06) 0%, transparent 55%)',
            }}
            aria-hidden
          />

          <motion.div
            variants={staggerParent(0.1, 0.05)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="relative z-10 max-w-lg"
          >
            <motion.span
              variants={fadeUp(0)}
              className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent/70"
            >
              Medical Authority
            </motion.span>

            <motion.h2
              variants={fadeUp(0)}
              id="authority-heading"
              className="mt-4 font-heading text-3xl font-extrabold leading-[1.08] text-white sm:text-4xl"
            >
              Led by Vaidya AKHIL HS{' '}
              <span className="font-body italic text-accent">(B.A.M.S)</span>
            </motion.h2>

            <motion.p
              variants={fadeUp(0)}
              className="mt-4 font-body text-[15px] leading-[1.75] text-white/55"
            >
              Our therapies are guided by a qualified Ayurveda Vaidya with over
              16 years of clinical experience from Kerala.
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={fadeUp(0)}
              className="mt-8 flex items-center gap-0"
            >
              {[
                { value: '16+', label: 'Years Experience' },
                { value: '8+', label: 'Years per Therapist' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.label}>
                  <div className="pr-6">
                    <p className="font-heading text-[2.5rem] font-extrabold leading-none tracking-tight text-white">
                      {s.value}
                    </p>
                    <p className="mt-1.5 font-body text-[10px] text-white/35">
                      {s.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="mr-6 h-10 w-px bg-accent/20" />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Credential rows */}
            <motion.div variants={fadeUp(0)} className="mt-10 flex flex-col">
              {credentials.map((cred, i) => (
                <div key={cred.label}>
                  {i > 0 && (
                    <div
                      className="h-px"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(212,163,115,0.15), transparent)',
                      }}
                      aria-hidden
                    />
                  )}
                  <div className="py-4">
                    <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/50">
                      {cred.label}
                    </span>
                    <p className="mt-1 font-heading text-[14px] font-semibold text-white/80">
                      {cred.value}
                    </p>
                  </div>
                </div>
              ))}
              <div
                className="h-px"
                style={{
                  background:
                    'linear-gradient(to right, rgba(212,163,115,0.15), transparent)',
                }}
                aria-hidden
              />
            </motion.div>

            {/* Therapist team note */}
            <motion.div
              variants={fadeUp(0)}
              className="mt-6 border-l-2 border-accent/40 pl-5"
            >
              <p className="font-body text-[14px] leading-[1.7] text-white/50">
                Our team of therapists from Kerala have completed Ayurveda
                therapy courses, each with 8+ years experience, and are all
                registered with KKM in Malaysia.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Full-bleed photograph ─────────────── */}
        <motion.div
          variants={clipReveal('right', 0.15)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative hidden min-h-[400px] lg:block"
        >
          <Image
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80"
            alt="Vaidya AKHIL HS — Lead Ayurvedic Physician at KALS"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 0vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.35)' }}
            aria-hidden
          />
          <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />
          {/* Left edge gold hairline */}
          <div
            className="absolute inset-y-0 left-0 w-px"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(212,163,115,0.3), transparent)',
            }}
            aria-hidden
          />
        </motion.div>

        {/* ── MOBILE: Image band ───────────────────────── */}
        <motion.div
          variants={clipReveal('bottom', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative h-[40vh] min-h-[250px] lg:hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80"
            alt="Vaidya AKHIL HS"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.35)' }}
            aria-hidden
          />
        </motion.div>
      </div>
    </section>
  )
}
