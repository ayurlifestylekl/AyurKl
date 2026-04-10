'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { slideIn, inViewOnce } from '@/lib/motion'
import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'

const painPoints = ['Burnout', 'Insomnia', 'Joint Pain']

export default function EmpathyBridge() {
  return (
    <section
      aria-labelledby="empathy-heading"
      className="relative overflow-hidden bg-cream"
    >
      {/* Decorative leaves */}
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ left: '3%', top: '12%', width: 38, height: 50, transform: 'rotate(-22deg)' }}
        opacity={0.18}
      />
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ right: '4%', bottom: '10%', width: 42, height: 56, transform: 'rotate(18deg)' }}
        opacity={0.16}
      />

      <h2 id="empathy-heading" className="sr-only">
        From modern stress to ancient healing
      </h2>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 sm:px-8 md:py-32 lg:grid-cols-[1fr_auto_1fr] lg:gap-0 lg:px-12">
        {/* ── LEFT: Modern Life ─────────────────────── */}
        <motion.div
          variants={slideIn('left', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col gap-6 lg:pr-16"
        >
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-dark/50">
            Modern Life
          </span>
          <h3 className="font-heading text-3xl font-extrabold leading-[1.1] text-dark/85 sm:text-4xl md:text-[42px]">
            Burnout. Bad sleep.
            <br />A body that won&apos;t slow down.
          </h3>
          <p className="max-w-md font-body text-[15px] leading-relaxed text-dark/60">
            Quick fixes mute the symptom. The next morning, the same tightness
            in your shoulders. The same fog behind your eyes.
          </p>

          {/* Pain-point chips */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {painPoints.map(p => (
              <span
                key={p}
                className="rounded-full border border-dark/15 bg-white/70 px-4 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-dark/55"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Desaturated photo */}
          <div className="relative mt-4 aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-[0_20px_60px_-30px_rgba(43,43,43,0.45)]">
            <Image
              src="https://images.unsplash.com/photo-1499914485622-a88fac536970?auto=format&fit=crop&w=900&q=80"
              alt="An exhausted urban professional resting their head on a desk"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover saturate-50"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(43,43,43,0.0) 40%, rgba(43,43,43,0.35) 100%)',
              }}
            />
          </div>
        </motion.div>

        {/* ── DIVIDER ───────────────────────────────── */}
        <div className="relative hidden lg:flex lg:h-[520px] lg:flex-col lg:items-center lg:justify-center">
          <div
            aria-hidden
            className="h-full w-px"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(212,163,115,0.55), transparent)',
            }}
          />
          <div className="absolute" style={{ width: 92, height: 92 }}>
            <BotanicalMandala opacity={0.6} />
          </div>
        </div>
        <div
          className="block h-px w-24 self-center bg-accent/40 lg:hidden"
          aria-hidden
        />

        {/* ── RIGHT: Ancient Healing ───────────────── */}
        <motion.div
          variants={slideIn('right', 0.1)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col gap-6 lg:pl-16"
        >
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            5,000-Year-Old Answer
          </span>
          <h3 className="font-heading text-3xl font-extrabold leading-[1.1] text-primary sm:text-4xl md:text-[42px]">
            Kerala Ayurveda in
            <br />
            Brickfields treats
            <br />
            the root, not the symptom.
          </h3>
          <p className="max-w-md font-body text-[15px] leading-relaxed text-dark/70">
            At Kerala Ayurvedic Lifestyle, we start with your dosha — your unique
            mind-body constitution. Then Vaidya AKHIL HS builds a personalised
            protocol of Abhyanga, Shirodhara or Panchakarma therapies that meet
            your body where it actually is.
          </p>

          <div className="pt-2">
            <Link
              href="#booking"
              className="group inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent"
            >
              Discover Your Dosha
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Vibrant photo */}
          <div className="relative mt-4 aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-[0_28px_70px_-30px_rgba(47,93,80,0.55)]">
            <Image
              src="https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&w=900&q=80"
              alt="Warm Ayurvedic herbs and oils arranged on a wooden tray"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 ring-1 ring-inset ring-accent/30"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
