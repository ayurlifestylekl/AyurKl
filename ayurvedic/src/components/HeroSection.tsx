'use client'

import React from 'react'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'
import CTAButton from '@/components/ui/CTAButton'

/* ── Animation helpers ──────────────────────────────────── */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay, ease: EASE_OUT_PREMIUM },
  },
})

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-primary pt-20">
      {/* ── Background Image & Cinematic Overlay ────────── */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/hero-spices.png"
          alt="Authentic Ayurvedic herbs and spices"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark/Green Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-[#1a332c]/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        
        {/* Eyebrow */}
        <motion.div {...fadeUp(0.1)} className="mb-6 flex items-center justify-center gap-4">
          <span className="h-[1px] w-12 bg-accent/60" aria-hidden />
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
            Est. 2008 • Brickfields, KL
          </span>
          <span className="h-[1px] w-12 bg-accent/60" aria-hidden />
        </motion.div>

        {/* Main Headline */}
        <motion.h1 {...fadeUp(0.25)} className="flex flex-col items-center justify-center">
          <span className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg">
            Authentic Kerala
          </span>
          <span className="mt-2 font-body text-[clamp(2.5rem,6vw,4.5rem)] italic leading-none text-accent drop-shadow-md">
            Ayurveda
          </span>
        </motion.h1>

        {/* Decorative divider */}
        <motion.div {...fadeUp(0.4)} className="my-8 flex items-center justify-center gap-3">
          <span className="h-[1px] w-16 bg-white/20" aria-hidden />
          <div className="h-1.5 w-1.5 rotate-45 bg-accent/80" aria-hidden />
          <span className="h-[1px] w-16 bg-white/20" aria-hidden />
        </motion.div>

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.5)}
          className="max-w-2xl font-body text-[15px] leading-[1.8] text-white/80 sm:text-[17px]"
        >
          Traditional Panchakarma, Abhyanga & Shirodhara — practised with precision and care by{' '}
          <strong className="font-semibold text-white">Vaidya AKHIL HS (B.A.M.S)</strong>.
        </motion.p>

        {/* CTA Button */}
        <motion.div {...fadeUp(0.65)} className="mt-10">
          <CTAButton
            href="https://wa.me/601165043436?text=Hi%2C%20I%20would%20like%20to%20book%20a%20consultation."
            variant="primary"
            size="lg"
            shimmer
            icon={<Calendar className="h-4 w-4" />}
            className="px-10 py-4 text-[13px]"
          >
            Book a Consultation
          </CTAButton>
        </motion.div>
      </div>

      {/* ── Floating Stats Bar (Bottom) ────────────────── */}
      <motion.div
        {...fadeUp(0.8)}
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/20 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          {[
            { n: '15+', l: 'Years Experience' },
            { n: '5,000+', l: 'Patients Healed' },
            { n: '20+', l: 'Authentic Therapies' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.l}>
              <div className="flex flex-col items-center text-center sm:flex-row sm:gap-4 sm:text-left">
                <span className="font-heading text-2xl font-bold text-white sm:text-3xl">
                  {s.n}
                </span>
                <span className="mt-1 font-heading text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:mt-0 sm:text-[10px] sm:leading-tight">
                  {s.l.replace(' ', '\n')}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden h-10 w-[1px] bg-white/10 sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
