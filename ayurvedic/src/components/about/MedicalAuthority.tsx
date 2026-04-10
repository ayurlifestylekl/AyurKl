'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BadgeCheck, GraduationCap, Stamp } from 'lucide-react'
import {
  fadeUp,
  inViewOnce,
  staggerParent,
  EASE_OUT_PREMIUM,
  useReducedMotionSafe,
} from '@/lib/motion'
import { BotanicalMandala } from '@/components/ui/Decorations'

const credentials = [
  {
    id: 'qualification',
    icon: GraduationCap,
    label: 'Qualification',
    value: 'B.A.M.S — Bachelor of Ayurvedic Medicine and Surgery',
  },
  {
    id: 'registration',
    icon: BadgeCheck,
    label: 'Registration',
    value: 'National Council of Indian System of Medicine (NCISM)',
  },
  {
    id: 'recognition',
    icon: Stamp,
    label: 'Recognition',
    value: 'Kementerian Kesihatan Malaysia (KKM)',
  },
]

export default function MedicalAuthority() {
  const reduceMotion = useReducedMotionSafe()

  return (
    <section
      aria-labelledby="medical-authority-heading"
      className="relative overflow-hidden bg-primary"
    >
      {/* Atmospheric gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 25% 15%, rgba(212,163,115,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 90%, rgba(122,157,84,0.12) 0%, transparent 55%)',
        }}
      />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Decorative mandalas */}
      <div className="pointer-events-none absolute -right-32 -top-32 hidden h-[520px] w-[520px] md:block">
        <BotanicalMandala opacity={0.07} />
      </div>
      <div className="pointer-events-none absolute -bottom-40 -left-32 hidden h-[480px] w-[480px] md:block">
        <BotanicalMandala opacity={0.05} />
      </div>

      {/* Section marker */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80">
            <span className="text-white/40">004</span> &nbsp;/&nbsp; Authority
          </span>
          <span className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 md:inline">
            Lead Vaidya &middot; B.A.M.S
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full bg-gradient-to-r from-accent/60 via-white/15 to-transparent"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-20 lg:grid-cols-12 lg:gap-20 lg:px-12">
        {/* ── LEFT: Vaidya portrait ─────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{
            opacity: 1,
            scale: 1,
            transition: { duration: 1.0, ease: EASE_OUT_PREMIUM },
          }}
          viewport={inViewOnce}
          className="relative mx-auto w-full max-w-[480px] lg:col-span-5"
        >
          <div className="relative" style={{ paddingBottom: '125%' }}>
            {/* Back gold-bordered frame */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
              className="absolute inset-0 rounded-[28px] border border-accent/45"
              style={{ rotate: '3deg' }}
              aria-hidden
            />

            {/* Front photo card */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.65)] ring-1 ring-accent/30"
              style={{ rotate: '-2deg' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80"
                alt="Vaidya AKHIL HS, BAMS-qualified Ayurvedic physician with 16+ years of experience from Kerala"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              {/* Color treatment */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(212,163,115,0.10) 0%, rgba(15,26,18,0.45) 100%)',
                }}
              />
              {/* In-image caption */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div className="flex flex-col">
                  <span className="font-heading text-[8px] font-bold uppercase tracking-[0.22em] text-white/70">
                    Lead Vaidya
                  </span>
                  <span className="font-heading text-[15px] font-extrabold leading-tight text-white">
                    Vaidya AKHIL HS
                  </span>
                </div>
                <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
                  004
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── RIGHT: Authority block ─────────────── */}
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col gap-7 lg:col-span-7"
        >
          <motion.span
            variants={fadeUp(0)}
            className="inline-flex w-fit items-center gap-3 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            <span aria-hidden className="h-px w-8 bg-accent" />
            Expertise You Can Trust
          </motion.span>

          <motion.h2
            id="medical-authority-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em] text-white sm:text-[48px] md:text-[60px]"
          >
            Led by a Vaidya.
            <br />
            <span className="font-body italic font-normal text-accent">
              Backed by lineage.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0)}
            className="max-w-xl font-body text-[16px] leading-[1.85] text-white/75 md:text-[17px]"
          >
            Our therapies are guided by a qualified Ayurveda Vaidya holding a
            B.A.M.S degree, with over 16 years of clinical experience from
            Kerala. Every consultation begins with him personally.
          </motion.p>

          {/* Hero stats — oversized numerals */}
          <motion.dl
            variants={fadeUp(0)}
            className="mt-2 grid grid-cols-2 gap-6 border-y border-accent/25 py-7 sm:max-w-md"
          >
            <div className="flex flex-col gap-1">
              <dt className="flex items-baseline gap-0.5 font-heading font-extrabold leading-none text-white">
                <span className="text-[56px] sm:text-[64px]">16</span>
                <span className="text-[24px] text-accent">+</span>
              </dt>
              <dd className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                Years of clinical
                <br />
                experience
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="flex items-baseline gap-0.5 font-heading font-extrabold leading-none text-white">
                <span className="text-[56px] sm:text-[64px]">B</span>
                <span className="text-[24px] text-accent">.A.M.S</span>
              </dt>
              <dd className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                Bachelor of Ayurvedic
                <br />
                Medicine &amp; Surgery
              </dd>
            </div>
          </motion.dl>

          {/* Credential rows */}
          <motion.ul
            variants={fadeUp(0)}
            className="mt-2 flex flex-col divide-y divide-accent/15"
          >
            {credentials.map(cred => {
              const Icon = cred.icon
              return (
                <li
                  key={cred.id}
                  className="group/cred grid grid-cols-12 items-center gap-4 py-5"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/40 transition-all duration-500 group-hover/cred:bg-accent/25 group-hover/cred:ring-accent/70"
                      aria-hidden
                    >
                      <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="col-span-10 flex flex-col sm:col-span-11">
                    <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent/80">
                      {cred.label}
                    </span>
                    <span className="font-heading text-[15px] font-semibold text-white">
                      {cred.value}
                    </span>
                  </div>
                </li>
              )
            })}
          </motion.ul>

          {/* Therapist note */}
          <motion.div
            variants={fadeUp(0)}
            className="relative mt-2 rounded-r-2xl bg-white/5 py-5 pl-6 pr-5 ring-1 ring-white/10"
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-1 rounded-l-full bg-accent"
            />
            <p className="font-body text-[14px] leading-[1.7] text-white/80 md:text-[15px]">
              Our therapists are trained in Kerala, hold over{' '}
              <span className="font-semibold text-white">8 years of experience</span>{' '}
              each, and are{' '}
              <span className="font-semibold text-white">
                KKM-registered in Malaysia
              </span>
              .
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
