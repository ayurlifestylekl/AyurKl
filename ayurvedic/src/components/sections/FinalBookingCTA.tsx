'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle } from 'lucide-react'
import CTAButton from '@/components/ui/CTAButton'
import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function FinalBookingCTA() {
  return (
    <section
      id="booking"
      aria-labelledby="booking-heading"
      className="relative overflow-hidden bg-primary"
    >
      {/* Layered botanical pattern */}
      <div className="pointer-events-none absolute -left-20 -top-20 hidden h-[480px] w-[480px] md:block">
        <BotanicalMandala opacity={0.05} />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -right-24 hidden h-[520px] w-[520px] md:block">
        <BotanicalMandala opacity={0.05} />
      </div>

      {/* Floating leaves */}
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ left: '8%', top: '18%', width: 38, height: 50, transform: 'rotate(-22deg)' }}
        color="#D4A373"
        opacity={0.22}
      />
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ right: '10%', top: '14%', width: 32, height: 44, transform: 'rotate(18deg)' }}
        color="#D4A373"
        opacity={0.18}
      />
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ left: '14%', bottom: '22%', width: 44, height: 58, transform: 'rotate(12deg)' }}
        color="#D4A373"
        opacity={0.16}
      />

      {/* Radial glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 700,
          height: 700,
          background:
            'radial-gradient(circle at center, rgba(212,163,115,0.22) 0%, rgba(212,163,115,0.08) 30%, transparent 65%)',
          filter: 'blur(20px)',
        }}
      />

      <motion.div
        variants={staggerParent(0.12, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:px-8 md:py-32 lg:px-12"
      >
        <motion.span
          variants={fadeUp(0)}
          className="inline-block font-heading text-[11px] font-bold uppercase tracking-[0.32em] text-accent"
        >
          Begin Your Journey
        </motion.span>

        <motion.h2
          id="booking-heading"
          variants={fadeUp(0)}
          className="mt-5 font-heading text-balance text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl md:text-[56px]"
        >
          Your first step toward
          <br />
          <span className="text-accent">lasting wellness.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp(0)}
          className="mx-auto mt-6 max-w-xl font-body text-[16px] leading-relaxed text-white/75"
        >
          Book a 30-minute Ayurvedic consultation with Vaidya AKHIL HS (B.A.M.S)
          at our Brickfields, KL clinic. We&apos;ll assess your dosha, listen to
          what your body is telling you, and design a personalised protocol you
          can actually live with.
        </motion.p>

        <motion.div
          variants={fadeUp(0)}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
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
          className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55"
        >
          <span>Since 2008</span>
          <span className="h-1 w-1 rounded-full bg-accent/60" />
          <span>Brickfields, KL</span>
          <span className="h-1 w-1 rounded-full bg-accent/60" />
          <span>Vaidya AKHIL HS (B.A.M.S)</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
