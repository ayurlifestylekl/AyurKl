'use client'

import React from 'react'
import Image from 'next/image'
import { Leaf, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'
import CTAButton from '@/components/ui/CTAButton'

/* ── Animation helpers ──────────────────────────────────── */
const clipFromRight = {
  initial: { clipPath: 'inset(0 0 0 100%)' },
  animate: {
    clipPath: 'inset(0 0 0 0)',
    transition: { duration: 1.0, delay: 0.2, ease: EASE_OUT_PREMIUM },
  },
}

const fadeSlow = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: EASE_OUT_PREMIUM },
  },
})

/* ─────────────────────────────────────────────────────────────
   HeroSection — Cinematic Split
   Left: editorial typography on cream
   Right: single full-height photograph bleeding to edge
───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-heroCream grain-overlay"
      style={{ minHeight: 'calc(100vh - 108px)' }}
    >
      <div
        className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[1fr_0.85fr]"
        style={{ minHeight: 'calc(100vh - 108px)' }}
      >
        {/* ── LEFT: Typography ──────────────────────────────── */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:py-20 lg:pl-12 xl:pl-20">
          {/* Eyebrow */}
          <motion.div {...fadeSlow(0.1)} className="flex items-center gap-2.5">
            <Leaf className="h-3.5 w-3.5 text-primary/60" />
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/55">
              Authentic Kerala Ayurveda · Brickfields KL
            </span>
          </motion.div>

          {/* Gold accent rule */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT_PREMIUM }}
            className="mt-5 h-[2px] w-12 origin-left rounded-full bg-accent/60"
          />

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT_PREMIUM }}
            className="mt-6 font-heading font-extrabold leading-[1.02] text-dark"
            style={{
              fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
              letterSpacing: '-0.03em',
            }}
          >
            Authentic{' '}
            <span className="text-primary">Kerala</span>
            <br className="hidden sm:block" />{' '}
            <span className="text-primary">Ayurveda</span> in the
            <br />
            Heart of{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Kuala Lumpur</span>
              <span
                className="absolute -bottom-1 left-0 right-0 h-[5px] rounded-full bg-accent/20"
                aria-hidden
              />
            </span>
          </motion.h1>

          {/* Body */}
          <motion.p
            {...fadeSlow(0.4)}
            className="mt-6 max-w-[420px] font-body text-[15px] leading-[1.75] text-dark/55"
          >
            Since 2008, Kerala Ayurvedic Lifestyle has brought authentic Panchakarma,
            Abhyanga &amp; Shirodhara treatments to Brickfields, KL — led by{' '}
            <strong className="font-semibold text-dark/75">
              Vaidya AKHIL HS (B.A.M.S)
            </strong>
            .
          </motion.p>

          {/* Single CTA */}
          <motion.div {...fadeSlow(0.55)} className="mt-8">
            <CTAButton
              href="https://wa.me/601165043436?text=Hi%2C%20I%20would%20like%20to%20book%20a%20consultation."
              variant="primary"
              shimmer
              icon={<Calendar className="h-4 w-4" />}
            >
              Book a Consultation
            </CTAButton>
          </motion.div>

          {/* Stats row */}
          <motion.div
            {...fadeSlow(0.7)}
            className="mt-10 flex items-center gap-0"
          >
            {[
              { n: '15+', l: 'Years in Brickfields' },
              { n: '5,000+', l: 'Patients Healed' },
              { n: '20+', l: 'Ayurvedic Therapies' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.l}>
                <div className="pr-5 sm:pr-7">
                  <p className="font-heading text-[1.35rem] sm:text-[1.5rem] font-extrabold leading-none tracking-tight text-primary">
                    {s.n}
                  </p>
                  <p className="mt-1.5 font-body text-[10px] text-dark/40">
                    {s.l}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="mr-5 h-8 w-px bg-accent/25 sm:mr-7" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Full-height photograph ──────────────────── */}
        <motion.div
          {...clipFromRight}
          className="relative hidden min-h-[500px] lg:block"
        >
          {/* Image */}
          <Image
            src="/hero-herbs.webp"
            alt="Authentic Ayurvedic herbs, spices and therapeutic oils at Kerala Ayurvedic Lifestyle Brickfields"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 0vw"
          />

          {/* Green tint overlay */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.08)' }}
          />

          {/* Soft gradient bleed into left column */}
          <div
            className="absolute inset-y-0 left-0 w-32"
            style={{
              background:
                'linear-gradient(to right, #f0ede5 0%, transparent 100%)',
            }}
          />

          {/* Subtle grain on image */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat',
              backgroundSize: '180px',
              opacity: 0.04,
              mixBlendMode: 'overlay',
            }}
          />
        </motion.div>

        {/* ── MOBILE: Image band (shown below lg) ───────────── */}
        <motion.div
          {...clipFromRight}
          className="relative h-[50vh] min-h-[300px] lg:hidden"
        >
          <Image
            src="/hero-herbs.webp"
            alt="Authentic Ayurvedic herbs and therapeutic oils"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.08)' }}
          />
          {/* Bottom fade into next section */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                'linear-gradient(to top, #f0ede5 0%, transparent 100%)',
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
