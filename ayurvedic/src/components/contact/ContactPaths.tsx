'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Package,
  Send,
} from 'lucide-react'

import SectionWrapper from '@/components/ui/SectionWrapper'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

type Variant = 'dark' | 'cream' | 'white'

interface Path {
  numeral: 'I' | 'II' | 'III'
  label: string
  body: string
  cta: string
  href: string
  icon: React.ElementType
  variant: Variant
}

const PATHS: Path[] = [
  {
    numeral: 'I',
    label: 'Book a consultation',
    body: 'Meet Vaidya AKHIL in person for a full case-history reading and a treatment plan tailored to your constitution.',
    cta: 'Book Now',
    href: '/treatments#booking',
    icon: CalendarDays,
    variant: 'dark',
  },
  {
    numeral: 'II',
    label: 'Ayur-Store support',
    body: 'Track an order, ask about product ingredients, or check stock before you buy.',
    cta: 'Store support',
    href: '/contact?intent=product#inquiry',
    icon: Package,
    variant: 'cream',
  },
  {
    numeral: 'III',
    label: 'Write to us',
    body: 'General questions, partnerships, press — anything that needs a longer conversation.',
    cta: 'Go to message form',
    href: '#inquiry',
    icon: Send,
    variant: 'white',
  },
]

export default function ContactPaths() {
  return (
    <SectionWrapper
      eyebrow="013  /  Choose your path"
      title="How can we help?"
      align="center"
      padding="standard"
      className="bg-[#FAF6EE]"
    >
      <motion.div
        variants={staggerParent(0.1, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-3"
      >
        {PATHS.map((p) => (
          <PathCard key={p.numeral} path={p} />
        ))}
      </motion.div>
    </SectionWrapper>
  )
}

function PathCard({ path }: { path: Path }) {
  const { numeral, label, body, cta, href, icon: Icon, variant } = path

  if (variant === 'dark') {
    return (
      <motion.article
        variants={fadeUp(0)}
        className="group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-primary p-8 text-white shadow-luxe ring-1 ring-white/10 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_44px_90px_-24px_rgba(47,93,80,0.55)] sm:p-10"
      >
        {/* Gold radial atmosphere top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 80% 10%, rgba(212,163,115,0.22) 0%, transparent 55%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col gap-5">
          <div className="flex items-start justify-between">
            <span className="font-body text-[38px] italic leading-none text-accent">
              {numeral}
            </span>
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
          </div>

          <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.28em] text-accent/80">
            Path I
          </span>

          <h3 className="font-heading text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-white">
            {label}
          </h3>

          <span
            aria-hidden
            className="h-px w-12 bg-accent/70 transition-[width] duration-500 ease-out group-hover:w-24"
          />

          <p className="font-body text-[14.5px] leading-[1.7] text-white/70">
            {body}
          </p>

          <div className="flex-1" />

          <Link
            href={href}
            className="group/cta mt-2 inline-flex w-fit items-center gap-2.5 rounded-full bg-accent px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-dark shadow-gold-glow transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-16px_rgba(212,163,115,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <span>{cta}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              strokeWidth={2.6}
            />
          </Link>
        </div>
      </motion.article>
    )
  }

  if (variant === 'cream') {
    return (
      <motion.article
        variants={fadeUp(0)}
        className="group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-white via-white to-[#FAF6EE] p-8 shadow-floating ring-1 ring-accent/25 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-luxe sm:p-10"
      >
        {/* Frame-in-frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[10px] rounded-[16px] border border-accent/15"
        />

        <div className="relative z-10 flex h-full flex-col gap-5">
          <div className="flex items-start justify-between">
            <span className="font-body text-[38px] italic leading-none text-accent">
              {numeral}
            </span>
            <Icon className="h-5 w-5 text-primary/60" strokeWidth={1.8} />
          </div>

          <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.28em] text-primary/55">
            Path II
          </span>

          <h3 className="font-heading text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-primary">
            {label}
          </h3>

          <span
            aria-hidden
            className="h-px w-12 bg-accent transition-[width] duration-500 ease-out group-hover:w-24"
          />

          <p className="font-body text-[14.5px] leading-[1.7] text-dark/70">
            {body}
          </p>

          <div className="flex-1" />

          <Link
            href={href}
            className="group/cta mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-white/60 px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-primary transition-[background-color,transform,border-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span>{cta}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              strokeWidth={2.6}
            />
          </Link>
        </div>
      </motion.article>
    )
  }

  // white variant (path III)
  return (
    <motion.article
      variants={fadeUp(0)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-white p-8 shadow-elevated ring-1 ring-primary/10 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-floating hover:ring-accent/30 sm:p-10"
    >
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between">
          <span className="font-body text-[38px] italic leading-none text-accent">
            {numeral}
          </span>
          <Icon className="h-5 w-5 text-primary/50" strokeWidth={1.8} />
        </div>

        <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.28em] text-primary/55">
          Path III
        </span>

        <h3 className="font-heading text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-primary">
          {label}
        </h3>

        <span
          aria-hidden
          className="h-px w-12 bg-accent transition-[width] duration-500 ease-out group-hover:w-24"
        />

        <p className="font-body text-[14.5px] leading-[1.7] text-dark/70">
          {body}
        </p>

        <div className="flex-1" />

        <Link
          href={href}
          className="group/cta mt-2 inline-flex w-fit items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-primary transition-colors duration-300 ease-out hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span>{cta}</span>
          <ArrowDown
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-y-0.5"
            strokeWidth={2.6}
          />
        </Link>
      </div>
    </motion.article>
  )
}
