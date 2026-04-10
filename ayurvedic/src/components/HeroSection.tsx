'use client'

import React, { useRef, useCallback } from 'react'
import { Leaf, Calendar } from 'lucide-react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { FloatingLeaf, BotanicalMandala } from '@/components/ui/Decorations'
import CTAButton from '@/components/ui/CTAButton'

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  /* Mouse parallax */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const spring = { stiffness: 55, damping: 22, mass: 0.8 }
  const springX = useSpring(rawX, spring)
  const springY = useSpring(rawY, spring)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    rawX.set(((e.clientX - left) / width  - 0.5) * 2)  // -1 … 1
    rawY.set(((e.clientY - top)  / height - 0.5) * 2)
  }, [rawX, rawY])

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  /* Per-layer parallax depths (pixels) */
  const backX  = useTransform(springX, v => v * -18)
  const backY  = useTransform(springY, v => v * -12)
  const frontX = useTransform(springX, v => v *  10)
  const frontY = useTransform(springY, v => v *   8)
  const statX  = useTransform(springX, v => v *  22)
  const statY  = useTransform(springY, v => v *  16)
  const pillX  = useTransform(springX, v => v * -14)
  const pillY  = useTransform(springY, v => v *  20)
  const orbX   = useTransform(springX, v => v *   6)
  const orbY   = useTransform(springY, v => v *   4)

  /* Entrance stagger */
  const fadeUp = (delay: number) => ({
    initial:    { opacity: 0, y: 28, scale: 0.96 },
    animate:    { opacity: 1, y: 0,  scale: 1 },
    transition: { duration: 0.7, delay, ease: [0.22, 0.92, 0.38, 1.0] as [number, number, number, number] },
  })

  return (
    <section className="relative overflow-hidden bg-heroCream grain-overlay" style={{ minHeight: 'calc(100vh - 108px)' }}>

      {/* ── Scattered background leaves ───────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <FloatingLeaf className="absolute" style={{ left:'1%',  top:'18%', width:44, height:58, transform:'rotate(-38deg)' }} opacity={0.45} />
        <FloatingLeaf className="absolute" style={{ left:'5%',  top:'8%',  width:32, height:44, transform:'rotate(22deg)'  }} opacity={0.28} />
        <FloatingLeaf className="absolute" style={{ left:'2%',  top:'58%', width:48, height:64, transform:'rotate(-18deg)' }} opacity={0.38} />
        <FloatingLeaf className="absolute" style={{ left:'24%', top:'5%',  width:26, height:36, transform:'rotate(14deg)'  }} opacity={0.22} />
        <FloatingLeaf className="absolute" style={{ left:'36%', top:'80%', width:34, height:46, transform:'rotate(-24deg)' }} opacity={0.26} />
      </div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div
        className="relative z-10 mx-auto flex max-w-7xl items-center px-6 sm:px-8 lg:px-12"
        style={{ minHeight: 'calc(100vh - 108px)' }}
      >
        <div className="grid w-full grid-cols-1 items-center gap-0 lg:grid-cols-[1fr_1.1fr]">

          {/* ── LEFT: Text ───────────────────────────────── */}
          <div className="flex flex-col items-start gap-5 py-16 lg:gap-7">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5"
            >
              <Leaf className="h-3 w-3 text-primary" />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Authentic Kerala Ayurveda · Brickfields KL
              </span>
            </motion.div>

            {/* Gold accent rule */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 0.92, 0.38, 1.0] }}
              className="h-[2px] w-16 origin-left rounded-full"
              style={{ background: 'linear-gradient(90deg, #D4A373, #e8b87a, transparent)' }}
            />

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 0.92, 0.38, 1.0] }}
              className="font-heading font-extrabold leading-[1.04] tracking-tight text-dark"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}
            >
              Authentic <span className="text-primary">Kerala</span><br className="hidden sm:block" />{' '}
              <span className="text-primary">Ayurveda</span> in the<br />
              Heart of{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Kuala Lumpur</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-accent/25" aria-hidden />
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-[440px] font-body text-[15px] leading-[1.75] text-dark/65"
            >
              Since 2008, Kerala Ayurvedic Lifestyle has brought authentic Panchakarma,
              Abhyanga &amp; Shirodhara treatments to Brickfields, KL — led by{' '}
              <strong className="font-semibold text-dark/80">Vaidya AKHIL HS (B.A.M.S)</strong>{' '}
              with 16+ years of clinical experience.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-1 flex flex-wrap items-center gap-3"
            >
              <CTAButton
                href="https://wa.me/601165043436?text=Hi%2C%20I%20would%20like%20to%20book%20a%20consultation."
                variant="primary"
                icon={<Calendar className="h-4 w-4" />}
              >
                Book a Consultation
              </CTAButton>
              <CTAButton
                href="/treatments"
                variant="outlineDark"
                iconRight={<Leaf className="h-4 w-4" />}
              >
                Explore Treatments
              </CTAButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 flex items-center gap-6 sm:gap-8 border-t border-primary/10 pt-5"
            >
              {[
                { n: '15+',   l: 'Years in Brickfields' },
                { n: '5000+', l: 'Patients Healed'      },
                { n: '20+',   l: 'Ayurvedic Therapies'  },
              ].map((s, i, arr) => (
                <div key={s.l} className="flex items-center gap-6 sm:gap-8">
                  <div>
                    <p className="font-heading text-[1.5rem] sm:text-[1.6rem] font-extrabold leading-none text-primary">{s.n}</p>
                    <p className="mt-1 font-body text-[10px] sm:text-[11px] text-dark/50">{s.l}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-8 w-px bg-primary/10" />}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Card Composition ───────────────────── */}
          <div
            ref={containerRef}
            className="relative flex items-center justify-center py-8 lg:py-0"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Mobile: single centered image card. Desktop: full parallax stack */}
            <div className="relative w-full max-w-[540px] aspect-[9/11]">

              {/* ── Ambient glow orb ─────────────────────── */}
              <motion.div
                style={{ x: orbX, y: orbY }}
                className="absolute pointer-events-none glow-breathe"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
              >
                <div
                  className="absolute"
                  style={{
                    width: '85%', height: '85%',
                    top: '12%', left: '6%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 40% 40%, rgba(212,163,115,0.22) 0%, rgba(47,93,80,0.16) 40%, transparent 70%)',
                    filter: 'blur(55px)',
                  }}
                />
              </motion.div>

              {/* ════════════════════════════════════════════
                  CARD 3 — Back dark card (tilted right)
              ════════════════════════════════════════════ */}
              <motion.div
                className="absolute hidden lg:block"
                style={{ x: backX, y: backY, right: '1.5%', top: '5%' }}
                {...fadeUp(0.15)}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  whileHover={{ scale: 1.025, transition: { duration: 0.3 } }}
                  className="rounded-[28px] cursor-pointer"
                  style={{
                    width: 330, height: 440,
                    rotate: '7deg',
                    background: 'linear-gradient(145deg, #3d7a66 0%, #2F5D50 40%, #1a3f33 100%)',
                    boxShadow: '0 32px 72px rgba(10,22,16,0.55), 0 8px 28px rgba(10,22,16,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Botanical mandala centre */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div style={{ width: 200, height: 200 }}>
                      <BotanicalMandala opacity={0.13} />
                    </div>
                  </div>

                  {/* Concentric corner arcs */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 330 440" fill="none" style={{ opacity: 0.07 }}>
                    <circle cx="330" cy="0"   r="180" stroke="#D4A373" strokeWidth="1.2"/>
                    <circle cx="330" cy="0"   r="130" stroke="#D4A373" strokeWidth="0.8"/>
                    <circle cx="330" cy="0"   r="80"  stroke="#D4A373" strokeWidth="0.5"/>
                    <circle cx="0"   cy="440" r="160" stroke="#D4A373" strokeWidth="1"/>
                    <circle cx="0"   cy="440" r="110" stroke="#D4A373" strokeWidth="0.6"/>
                  </svg>

                  {/* Gold shimmer sweep */}
                  <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none">
                    <div className="shimmer-sweep-delayed absolute inset-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(212,163,115,0.08) 50%, transparent 70%)',
                        width: '60%',
                      }}
                    />
                  </div>

                  {/* Top gold rule */}
                  <div className="absolute top-0 left-10 right-10 h-px"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.5), transparent)' }}
                  />

                  {/* Top-right orbit badge */}
                  <div className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center">
                    <div className="ring-pulse absolute w-12 h-12 rounded-full"
                      style={{ border: '1px solid rgba(212,163,115,0.25)' }}
                    />
                    <div className="absolute w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ border: '1.5px solid rgba(212,163,115,0.4)' }}
                    >
                      <div className="w-3 h-3 rounded-full soft-pulse"
                        style={{ background: 'rgba(212,163,115,0.75)' }}
                      />
                    </div>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1" style={{ background: 'rgba(212,163,115,0.3)' }} />
                      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4A373]/60">Est. 2008</span>
                      <div className="h-px flex-1" style={{ background: 'rgba(212,163,115,0.3)' }} />
                    </div>
                    <p className="font-heading text-[17px] font-bold text-white/40 leading-snug tracking-wide">
                      Kerala&apos;s Healing<br/>Tradition
                    </p>
                    {/* Subtle leaf row */}
                    <div className="flex gap-1.5 mt-3">
                      {[0.35, 0.2, 0.12].map((op, i) => (
                        <FloatingLeaf key={i} style={{ width: 10, height: 14, display: 'inline-block', transform: `rotate(${-10 + i * 10}deg)` }} color="#D4A373" opacity={op} />
                      ))}
                    </div>
                  </div>

                  {/* Subtle grain overlay */}
                  <div className="absolute inset-0 rounded-[28px] pointer-events-none"
                    style={{
                      background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                      opacity: 0.4,
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* ════════════════════════════════════════════
                  CARD 1 — Front image card (main)
              ════════════════════════════════════════════ */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-auto lg:top-auto lg:translate-x-0 lg:translate-y-0"
                style={{ x: frontX, y: frontY, ...(typeof window !== 'undefined' && window.innerWidth >= 1024 ? { left: '7.8%', top: '2%' } : {}) }}
                {...fadeUp(0.3)}
              >
                <motion.div
                  animate={{ y: [0, -11, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.35 } }}
                  className="rounded-[28px] overflow-hidden cursor-pointer w-[260px] h-[344px] sm:w-[280px] sm:h-[370px] lg:w-[310px] lg:h-[410px]"
                  style={{
                    rotate: '-3deg',
                    boxShadow: '0 48px 96px rgba(15,31,24,0.36), 0 16px 40px rgba(15,31,24,0.22), 0 0 0 1px rgba(255,255,255,0.75)',
                  }}
                >
                  {/* Warm cream background */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, #fefaf5 0%, #f8efe2 60%, #f2e4d0 100%)' }}
                  />

                  {/* Inner top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, transparent 100%)' }}
                  />

                  {/* Hero image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/hero-tray.png"
                    alt="Authentic Ayurvedic herbs, spices and therapeutic oils at Kerala Ayurvedic Lifestyle Brickfields"
                    className="absolute w-full h-full object-contain object-center"
                    style={{ padding: '14px 10px 72px' }}
                  />

                  {/* Soft edge vignette on image area */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(30,20,10,0.06) 100%)',
                    }}
                  />

                  {/* Bottom gradient band */}
                  <div className="absolute bottom-0 left-0 right-0 px-5 py-4 sm:px-6 sm:py-5"
                    style={{ background: 'linear-gradient(to top, #1a3f33 0%, #2F5D50 65%, transparent 100%)' }}
                  >
                    {/* Shimmer sweep on label */}
                    <div className="relative overflow-hidden">
                      <p className="font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-accent mb-1">Pure · Natural · Authentic</p>
                      <div className="shimmer-sweep absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.2) 50%, transparent 80%)',
                          width: '50%',
                        }}
                      />
                    </div>
                    <p className="font-heading text-[14px] sm:text-[16px] font-bold text-white leading-tight">Ayurvedic Healing</p>
                  </div>

                  {/* CERTIFIED badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3.5 overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #e8b87a 0%, #D4A373 50%, #c4924a 100%)',
                      boxShadow: '0 4px 20px rgba(212,163,115,0.55), 0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1L7.5 4.5H11L8.5 6.8L9.5 10.5L6 8.5L2.5 10.5L3.5 6.8L1 4.5H4.5L6 1Z" fill="white"/>
                    </svg>
                    <span className="font-heading text-[9px] font-extrabold uppercase tracking-[0.18em] text-white">Certified</span>
                    <div className="shimmer-sweep absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)',
                        width: '50%',
                      }}
                    />
                  </div>

                  {/* Subtle texture grid */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(47,93,80,0.012) 40px, rgba(47,93,80,0.012) 41px)' }}
                  />
                </motion.div>
              </motion.div>

              {/* ════════════════════════════════════════════
                  CARD 2 — Stat card (15+ Years) — Desktop only
              ════════════════════════════════════════════ */}
              <motion.div
                className="absolute hidden lg:block"
                style={{ x: statX, y: statY, left: '0.7%', bottom: '3%' }}
                {...fadeUp(0.45)}
              >
                <motion.div
                  animate={{ y: [0, -13, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  whileHover={{ scale: 1.06, transition: { duration: 0.3 } }}
                  className="rounded-[24px] cursor-pointer overflow-hidden"
                  style={{
                    width: 196, height: 216,
                    rotate: '-5deg',
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 60px rgba(47,93,80,0.2), 0 6px 20px rgba(47,93,80,0.12), 0 0 0 1px rgba(212,163,115,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
                  }}
                >
                  {/* Subtle top gradient */}
                  <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(212,163,115,0.07) 0%, transparent 100%)' }}
                  />

                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Gold accent bar */}
                    <div className="w-8 h-[3px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D4A373, #e8b87a)' }}
                    />

                    {/* Stat */}
                    <div>
                      <div className="flex items-start gap-0.5">
                        <span
                          className="font-heading text-[3.8rem] font-black leading-none"
                          style={{
                            letterSpacing: '-0.03em',
                            background: 'linear-gradient(135deg, #2F5D50 0%, #3d7a66 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >15</span>
                        <span className="font-heading text-[2rem] font-black text-accent mt-2">+</span>
                      </div>
                      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-dark/45 mt-0.5">
                        Years in<br/>Brickfields
                      </p>
                    </div>

                    {/* Trusted pill */}
                    <div className="flex items-center gap-2 self-start rounded-full px-3 py-1.5"
                      style={{ background: 'rgba(47,93,80,0.06)', border: '1px solid rgba(47,93,80,0.12)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full soft-pulse" style={{ background: '#D4A373' }} />
                      <span className="font-heading text-[9px] font-extrabold uppercase tracking-[0.2em] text-primary">Trusted</span>
                    </div>
                  </div>

                  {/* Shimmer sweep */}
                  <div className="shimmer-sweep-delayed absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                      width: '60%',
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* ════════════════════════════════════════════
                  FLOATING PILL — 20+ Treatments — Desktop only
              ════════════════════════════════════════════ */}
              <motion.div
                className="absolute hidden lg:block"
                style={{ x: pillX, y: pillY, right: '1.9%', bottom: '14.5%' }}
                {...fadeUp(0.6)}
              >
                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  whileHover={{ scale: 1.08, transition: { duration: 0.3 } }}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer overflow-hidden"
                  style={{
                    rotate: '2.5deg',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 16px 44px rgba(47,93,80,0.2), 0 4px 12px rgba(47,93,80,0.1), 0 0 0 1px rgba(212,163,115,0.3), inset 0 1px 0 rgba(255,255,255,1)',
                  }}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #3d7a66 0%, #2F5D50 50%, #264d42 100%)',
                      boxShadow: '0 4px 12px rgba(47,93,80,0.4)',
                    }}
                  >
                    <svg className="w-4.5 h-4.5" width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3C7 3 5 5.5 5 8.5C5 12 7.5 15 10 16.5C12.5 15 15 12 15 8.5C15 5.5 13 3 10 3Z" fill="#D4A373"/>
                      <circle cx="10" cy="8" r="2" fill="white" opacity="0.85"/>
                    </svg>
                  </div>

                  {/* Text */}
                  <div>
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className="font-heading text-[24px] font-black leading-none"
                        style={{
                          background: 'linear-gradient(135deg, #2F5D50 0%, #3d7a66 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >20</span>
                      <span className="font-heading text-[15px] font-black text-accent">+</span>
                    </div>
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-dark/45">Treatments</p>
                  </div>

                  {/* Shimmer */}
                  <div className="shimmer-sweep absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)',
                      width: '60%',
                      animationDelay: '2.4s',
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* ════════════════════════════════════════════
                  AMBIENT DOT ACCENTS
              ════════════════════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="pointer-events-none hidden lg:block"
              >
                {/* Gold cluster top-right */}
                <div className="absolute rounded-full bg-accent soft-pulse" style={{ top: '2.3%', right: '20%', width: 11, height: 11 }} />
                <div className="absolute rounded-full bg-accent" style={{ top: '5.2%', right: '24.4%', width: 7, height: 7, opacity: 0.35 }} />
                <div className="absolute rounded-full bg-accent" style={{ top: '1.3%',  right: '26.7%', width: 4, height: 4,  opacity: 0.22 }} />
                {/* Green dot bottom-left */}
                <div className="absolute rounded-full bg-primary" style={{ bottom: '2%', left: '3.7%', width: 6, height: 6, opacity: 0.3 }} />
                {/* Gold dot mid-right */}
                <div className="absolute rounded-full bg-accent" style={{ top: '50%', right: '0.4%', width: 5, height: 5, opacity: 0.4 }} />
                {/* Extra subtle dots */}
                <div className="absolute rounded-full bg-accent" style={{ top: '28%', left: '11%', width: 4, height: 4, opacity: 0.15 }} />
                <div className="absolute rounded-full bg-primary" style={{ bottom: '30%', right: '9.3%', width: 3, height: 3, opacity: 0.2 }} />
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
