'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { LotusMark } from '@/components/ui/Ornament'

/* ── Palette (section-local; matches new hero language) ── */
const EMERALD       = '#6E1023'
const EMERALD_SOFT  = 'rgba(110, 16, 35,0.78)'
const SAFFRON       = '#D4AF37'
const SAFFRON_DEEP  = '#D4AF37'
const CREAM         = '#F7F2E8'
const CREAM_WARM    = '#E9CBA6'

/* ── Five signature therapy categories ─────────────────── */
type Category = {
  slug: string
  name: string
  tagline: string
  durationMin: number
  image: string
  href: string
}

const categories: Category[] = [
  {
    slug: 'spine-joint',
    name: 'Spine & Joint Care',
    tagline: 'Restore Mobility & Strength',
    durationMin: 60,
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=spine-joint',
  },
  {
    slug: 'hair-skin',
    name: 'Hair & Skin Care',
    tagline: 'Glow From Within',
    durationMin: 50,
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=hair-skin',
  },
  {
    slug: 'post-delivery',
    name: 'Post-Delivery Care',
    tagline: 'For New Mothers',
    durationMin: 75,
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=post-delivery',
  },
  {
    slug: 'de-stress',
    name: 'De-Stress Therapy',
    tagline: 'Quiet the Nervous System',
    durationMin: 45,
    image:
      'https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=de-stress',
  },
  {
    slug: 'panchakarma',
    name: 'Panchakarma',
    tagline: 'Five-Stage Detox',
    durationMin: 90,
    image: '/Ayurvedic-wellness-flat-lay-arrangement-1024x683.png',
    href: '/treatments?category=panchakarma',
  },
]

/**
 * Editorial bento grid — one feature card + four smaller cards.
 * Content-driven height, asymmetric header, palette synced to hero.
 */
export default function ClinicTherapies() {
  return (
    <section
      id="clinic-therapies"
      aria-labelledby="therapies-heading"
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${CREAM} 0%, ${CREAM_WARM} 100%)`,
      }}
    >
      {/* Atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 45% at 10% 5%, rgba(212, 175, 55,0.18) 0%, transparent 65%), radial-gradient(45% 55% at 92% 90%, rgba(110, 16, 35,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Botanical lotus — right edge, subtle */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute -right-20 top-1/3 hidden h-[300px] w-[300px] opacity-[0.05] lg:block"
      >
        <g transform="translate(100 100)">
          {[0, 60, 120, 180, 240, 300].map((rot) => (
            <g key={rot} transform={`rotate(${rot})`}>
              <path
                d="M0 -70 C 20 -45, 25 -15, 0 0 C -25 -15, -20 -45, 0 -70 Z"
                fill={EMERALD}
              />
            </g>
          ))}
          <circle r="6" fill={SAFFRON} />
        </g>
      </svg>

      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top saffron hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 4%, rgba(212, 175, 55,0.45) 50%, transparent 96%)',
        }}
      />
      {/* Centered lotus medallion on the top hairline */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-2.5"
        style={{ backgroundColor: CREAM, border: '1px solid rgba(212, 175, 55,0.5)' }}
      >
        <LotusMark className="h-5 w-5" />
      </div>
      {/* Bottom saffron hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 4%, rgba(212, 175, 55,0.40) 50%, transparent 96%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-14 sm:px-10 sm:py-16 lg:px-12 lg:py-20">

        {/* ── Asymmetric Header: title left / byline+CTA right ── */}
        <motion.header
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12"
        >
          {/* Title block */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span
                className="h-px w-12"
                style={{ backgroundColor: SAFFRON_DEEP, opacity: 0.55 }}
                aria-hidden
              />
              <span
                className="font-heading text-[11px] font-bold uppercase tracking-[0.36em] sm:text-[12px]"
                style={{ color: SAFFRON_DEEP }}
              >
                At The Centre
              </span>
            </div>

            <h2 id="therapies-heading" className="mt-5 flex flex-col items-start">
              <span
                className="font-heading font-extrabold tracking-tight"
                style={{
                  color: EMERALD,
                  fontSize: 'clamp(2.25rem, 4.4vw, 3.75rem)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.02em',
                }}
              >
                Signature
              </span>
              <span
                className="-mt-1 font-display italic"
                style={{
                  color: SAFFRON,
                  fontSize: 'clamp(2.5rem, 5.2vw, 4.25rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.015em',
                  textShadow: '0 3px 22px rgba(212, 175, 55,0.25)',
                }}
              >
                Therapies
              </span>
            </h2>
          </div>

          {/* Byline + CTA */}
          <div className="lg:col-span-7 lg:border-l lg:pl-12" style={{ borderColor: `${SAFFRON}33` }}>
            <p
              className="font-body leading-[1.7]"
              style={{
                color: EMERALD_SOFT,
                fontSize: 'clamp(15px, 1.1vw, 17px)',
              }}
            >
              Under the expert guidance of our{' '}
              <span className="font-semibold" style={{ color: EMERALD }}>
                certified Vaidyas
              </span>{' '}
              and performed by highly experienced therapists from{' '}
              <span className="font-semibold" style={{ color: EMERALD }}>
                Kerala, India
              </span>
              .
            </p>

            <p
              className="mt-3 font-display italic leading-[1.55]"
              style={{
                color: 'rgba(110, 16, 35,0.62)',
                fontSize: 'clamp(14px, 1.05vw, 16px)',
              }}
            >
              All treatments are tailored to your dosha — a deeply restorative,
              authentic healing experience.
            </p>

            <div className="mt-5">
              <Link
                href="/treatments"
                className="group inline-flex items-center gap-3 rounded-full px-7 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  backgroundColor: EMERALD,
                  boxShadow: `0 18px 40px -18px ${EMERALD}99`,
                }}
              >
                Explore All Therapies
                <ArrowRight className="h-[14px] w-[14px] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.header>

        {/* ── Bento Card Grid: 1 feature + 4 smaller ── */}
        <motion.ol
          variants={staggerParent(0.08, 0.15)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-4 lg:auto-rows-[260px] lg:gap-5"
        >
          {categories.map((cat, i) => (
            <CategoryCard key={cat.slug} cat={cat} index={i} featured={i === 0} />
          ))}
        </motion.ol>
      </div>
    </section>
  )
}

function CategoryCard({
  cat,
  index,
  featured,
}: {
  cat: Category
  index: number
  featured: boolean
}) {
  const numberLabel = `0${index + 1}`

  return (
    <motion.li
      variants={fadeUp(0)}
      className={`group relative flex flex-col ${
        featured ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''
      }`}
    >
      <Link
        href={cat.href}
        aria-label={`Discover ${cat.name} — ${cat.tagline}`}
        className="block h-full rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ ['--tw-ring-color' as string]: SAFFRON } as React.CSSProperties}
      >
        <div
          className={`relative w-full overflow-hidden rounded-sm ${
            featured
              ? 'aspect-[4/5] sm:aspect-[16/9] lg:aspect-auto lg:h-full'
              : 'aspect-[4/5] lg:aspect-auto lg:h-full'
          }`}
          style={{ boxShadow: `0 14px 36px -18px ${EMERALD}66, inset 0 0 0 1px rgba(212, 175, 55,0.45)` }}
        >
          <Image
            src={cat.image}
            alt={`${cat.name} — ${cat.tagline}`}
            fill
            sizes={
              featured
                ? '(max-width: 1024px) 100vw, 50vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
            }
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {/* Emerald wash */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(110, 16, 35,0.18)' }}
          />

          {/* Bottom gradient for legibility */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[70%]"
            style={{
              background:
                'linear-gradient(to top, rgba(53, 7, 16,0.88) 0%, rgba(53, 7, 16,0.40) 50%, transparent 100%)',
            }}
          />

          {/* Saffron glow on hover */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 0%, rgba(212, 175, 55,0.30) 0%, transparent 70%)',
            }}
          />

          {/* Top metadata: index + duration */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 lg:p-4">
            <span
              className="inline-flex items-center justify-center rounded-sm px-2 py-1 font-heading text-[10px] font-bold tracking-[0.22em] backdrop-blur-sm sm:text-[11px]"
              style={{
                backgroundColor: 'rgba(53, 7, 16,0.55)',
                color: SAFFRON,
                border: `1px solid ${SAFFRON}55`,
              }}
            >
              {numberLabel}
            </span>
            <span className="font-display text-[11px] italic tracking-wide text-white/95 sm:text-[12px]">
              {cat.durationMin} min
            </span>
          </div>

          {/* Feature badge (only on the big card) */}
          {featured && (
            <div className="absolute left-3 top-12 lg:left-4 lg:top-14">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.28em] backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(212, 175, 55,0.18)',
                  color: SAFFRON,
                  border: `1px solid ${SAFFRON}66`,
                }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: SAFFRON }}
                />
                Most Requested
              </span>
            </div>
          )}

          {/* Bottom: name + tagline + corner arrow chip */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 lg:p-5">
            <div className="min-w-0 flex-1">
              <h3
                className="font-heading font-extrabold tracking-tight text-white drop-shadow-sm"
                style={{
                  fontSize: featured ? 'clamp(20px, 2vw, 28px)' : 'clamp(15px, 1.25vw, 19px)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                {cat.name}
              </h3>
              <p
                className="mt-1 font-display italic leading-snug"
                style={{
                  color: 'rgba(247, 242, 232,0.82)',
                  fontSize: featured ? 'clamp(13px, 1.05vw, 16px)' : '12.5px',
                }}
              >
                {cat.tagline}
              </p>
            </div>

            {/* Arrow chip */}
            <span
              aria-hidden
              className={`inline-flex shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 ${
                featured ? 'h-11 w-11' : 'h-9 w-9'
              }`}
              style={{
                borderColor: `${SAFFRON}55`,
                backgroundColor: 'rgba(212, 175, 55,0.14)',
              }}
            >
              <ArrowRight
                className={featured ? 'h-[16px] w-[16px]' : 'h-[14px] w-[14px]'}
                style={{ color: SAFFRON }}
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  )
}
