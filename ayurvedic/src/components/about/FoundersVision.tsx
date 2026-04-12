'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { clipReveal, fadeUp, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'

/**
 * Founder's story — sticky sidebar portrait + editorial text.
 * No drop-cap, no oversized quote marks, no BotanicalMandala.
 */
export default function FoundersVision() {
  return (
    <section
      aria-labelledby="founder-heading"
      className="relative bg-cream"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
          {/* ── LEFT: Sticky portrait ──────────────────── */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            {/* Portrait */}
            <motion.div
              variants={clipReveal('left', 0)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl lg:aspect-[3/4]"
            >
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                alt="Datto Shan — Founder of Kerala Ayurvedic Lifestyle"
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ backgroundColor: 'rgba(47,93,80,0.08)' }}
                aria-hidden
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(26,46,38,0.4) 0%, transparent 40%)',
                }}
                aria-hidden
              />
            </motion.div>

            {/* Founder name */}
            <motion.div
              variants={fadeUp(0.3)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="mt-4"
            >
              <p className="font-body text-[18px] font-medium italic text-primary">
                Datto Shan
              </p>
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-dark/40">
                Founder
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT: Editorial text ──────────────────── */}
          <div className="relative flex flex-col">
            {/* Vertical gold divider (desktop only) */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.0, ease: EASE_OUT_PREMIUM }}
              className="absolute -left-8 bottom-0 top-0 hidden w-px origin-center lg:block"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(212,163,115,0.35), transparent)',
              }}
              aria-hidden
            />

            {/* Mobile horizontal divider */}
            <div
              className="mb-8 h-px lg:hidden"
              style={{
                background:
                  'linear-gradient(to right, rgba(212,163,115,0.3), transparent)',
              }}
              aria-hidden
            />

            <motion.div
              variants={fadeUp(0)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
            >
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
                Our Story
              </span>
              <h2
                id="founder-heading"
                className="mt-3 font-heading text-3xl font-extrabold leading-[1.08] text-primary sm:text-4xl"
              >
                Bringing Kerala&apos;s healing{' '}
                <span className="font-body italic text-accent">home.</span>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp(0.15)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="mt-6 flex flex-col gap-5"
            >
              <p className="max-w-lg font-body text-[15px] leading-[1.75] text-dark/60">
                Kerala Ayurvedic Lifestyle was founded with a simple yet powerful
                vision — to provide genuine Kerala Ayurvedic therapies to people in
                Malaysia without compromise.
              </p>
              <p className="max-w-lg font-body text-[15px] leading-[1.75] text-dark/60">
                Inspired by witnessing the profound healing experienced by
                individuals who traveled to Kerala, Datto Shan envisioned creating
                the same experience closer to home.
              </p>
              <p className="max-w-lg font-body text-[15px] leading-[1.75] text-dark/60">
                By bringing skilled therapists and experienced Ayurveda
                practitioners directly from Kerala, we ensure that every therapy
                reflects the true essence of this ancient science. Our journey has
                always been guided by authenticity, care, and a deep respect for
                traditional healing methods.
              </p>
            </motion.div>

            {/* Pull quote — thin left border, no oversized quote marks */}
            <motion.blockquote
              variants={fadeUp(0.3)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="mt-8 border-l-2 border-accent/50 pl-6"
            >
              <p className="max-w-md font-body text-[17px] italic leading-[1.6] text-primary/80">
                &ldquo;True wellness is not just about therapies, but about
                restoring balance and harmony within.&rdquo;
              </p>
            </motion.blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
