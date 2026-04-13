'use client'

import React from 'react'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'
import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import CTAButton from '@/components/ui/CTAButton'

/* ── Animation helpers ──────────────────────────────────── */
const fadeSlow = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: EASE_OUT_PREMIUM },
  },
})

/* ─────────────────────────────────────────────────────────────
   HeroSection — Warm Luxury Split
   Left: warm cream with gold accents + refined editorial type
   Right: Ayurvedic flat-lay, full-height, naturally blended
───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-heroCream"
      style={{ height: 'calc(100vh - 108px)', minHeight: '580px', maxHeight: '840px' }}
    >
      {/* ── Atmospheric warmth on cream panel ─────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(212,163,115,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(122,157,84,0.05) 0%, transparent 50%)',
        }}
        aria-hidden
      />

      {/* ── Subtle grain on cream ────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
        aria-hidden
      />

      {/* ── Decorative mandalas (cream side) ─────────────── */}
      <div className="pointer-events-none absolute -left-40 top-1/2 hidden h-[500px] w-[500px] -translate-y-1/2 lg:block">
        <BotanicalMandala opacity={0.07} stroke="#D4A373" />
      </div>

      {/* ── Floating leaves ──────────────────────────────── */}
      <FloatingLeaf
        className="pointer-events-none absolute hidden lg:block"
        style={{ left: '3%', top: '15%', width: 28, height: 38, transform: 'rotate(-20deg)' }}
        color="rgba(47,93,80,0.08)"
        strokeColor="#2F5D50"
        opacity={0.12}
      />
      <FloatingLeaf
        className="pointer-events-none absolute hidden lg:block"
        style={{ left: '42%', bottom: '12%', width: 22, height: 30, transform: 'rotate(35deg)' }}
        color="rgba(212,163,115,0.1)"
        strokeColor="#D4A373"
        opacity={0.1}
      />

      {/* ── Main grid ────────────────────────────────────── */}
      <div className="relative z-10 mx-auto grid h-full max-w-[1440px] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">

        {/* ── LEFT: Typography panel ──────────────────────── */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:py-0 lg:pl-12 xl:pl-20">
          {/* Gold accent line + eyebrow */}
          <motion.div {...fadeSlow(0.1)} className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent/50" aria-hidden />
            <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.4em] text-accent sm:text-[10px]">
              Est. 2008 · Brickfields, KL
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.25, ease: EASE_OUT_PREMIUM }}
            className="mt-5 lg:mt-7"
          >
            <span
              className="block font-heading font-extrabold leading-[1.04] text-primary"
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Authentic Kerala
            </span>
            <span
              className="mt-1 block font-body italic text-accent"
              style={{
                fontSize: 'clamp(1.9rem, 3.8vw, 3rem)',
                lineHeight: 1.15,
              }}
            >
              Ayurveda
            </span>
          </motion.h1>

          {/* Ornamental gold divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.0, delay: 0.4, ease: EASE_OUT_PREMIUM }}
            className="mt-4 flex origin-left items-center gap-2.5 lg:mt-5"
            aria-hidden
          >
            <span className="h-px w-8 bg-accent/40" />
            <span className="text-[6px] text-accent/50">&#9670;</span>
            <span className="h-px w-8 bg-accent/40" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            {...fadeSlow(0.45)}
            className="mt-4 max-w-[380px] font-body text-[14px] leading-[1.75] text-dark/50 lg:mt-5"
          >
            Traditional Panchakarma, Abhyanga &amp; Shirodhara —
            practised with precision by{' '}
            <strong className="font-semibold text-dark/70">
              Vaidya AKHIL HS (B.A.M.S)
            </strong>
            .
          </motion.p>

          {/* CTA */}
          <motion.div {...fadeSlow(0.55)} className="mt-6 lg:mt-7">
            <CTAButton
              href="https://wa.me/601165043436?text=Hi%2C%20I%20would%20like%20to%20book%20a%20consultation."
              variant="primary"
              size="lg"
              shimmer
              icon={<Calendar className="h-4 w-4" />}
            >
              Book a Consultation
            </CTAButton>
          </motion.div>

          {/* Stats row */}
          <motion.div
            {...fadeSlow(0.7)}
            className="mt-8 flex items-center gap-0 lg:mt-10"
          >
            {[
              { n: '15+', l: 'Years' },
              { n: '5,000+', l: 'Patients' },
              { n: '20+', l: 'Therapies' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.l}>
                <div className="pr-5 sm:pr-7">
                  <p className="font-heading text-[1.2rem] font-extrabold leading-none tracking-tight text-primary sm:text-[1.35rem]">
                    {s.n}
                  </p>
                  <p className="mt-1 font-heading text-[8px] font-semibold uppercase tracking-[0.15em] text-dark/30 sm:text-[9px]">
                    {s.l}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="mr-5 h-7 w-px bg-accent/20 sm:mr-7 sm:h-8" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Image panel (desktop) ────────────────── */}
        <motion.div
          initial={{ clipPath: 'inset(0 0 0 100%)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT_PREMIUM }}
          className="relative hidden lg:block"
        >
          {/* Slow cinematic zoom */}
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 5, ease: EASE_OUT_PREMIUM }}
            className="absolute inset-0"
          >
            <Image
              src="/hero-spices.png"
              alt="Authentic Ayurvedic herbs, spices and therapeutic oils"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 0vw"
            />
          </motion.div>

          {/* Warm green tint for brand cohesion */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.04)' }}
            aria-hidden
          />

          {/* Left bleed: cream fading into image */}
          <div
            className="absolute inset-y-0 left-0 w-40 xl:w-52"
            style={{
              background:
                'linear-gradient(to right, #f0ede5 0%, rgba(240,237,229,0.7) 40%, rgba(240,237,229,0.25) 70%, transparent 100%)',
            }}
            aria-hidden
          />

          {/* Bottom warmth fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{
              background:
                'linear-gradient(to top, rgba(240,237,229,0.5) 0%, transparent 100%)',
            }}
            aria-hidden
          />

          {/* Subtle grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat',
              backgroundSize: '180px',
            }}
            aria-hidden
          />

          {/* Gold frame accent — inner border on the image */}
          <div className="pointer-events-none absolute inset-6 z-10 rounded-sm border border-accent/10 xl:inset-8" aria-hidden />
        </motion.div>

        {/* ── MOBILE: Image band ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_PREMIUM }}
          className="relative mx-6 mb-8 aspect-[16/10] overflow-hidden rounded-2xl shadow-elevated ring-1 ring-accent/15 sm:mx-10 lg:hidden"
        >
          <Image
            src="/hero-spices.png"
            alt="Authentic Ayurvedic herbs and therapeutic oils"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.04)' }}
            aria-hidden
          />
          {/* Inner gold frame on mobile too */}
          <div className="pointer-events-none absolute inset-3 rounded-lg border border-accent/10" aria-hidden />
        </motion.div>
      </div>

      {/* ── Bottom gold hairline ─────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(212,163,115,0.3) 20%, rgba(212,163,115,0.3) 80%, transparent)',
        }}
        aria-hidden
      />
    </section>
  )
}
