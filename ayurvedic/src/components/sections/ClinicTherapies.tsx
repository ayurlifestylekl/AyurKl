'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

/* ── Minimal-luxury layout, harmonized to the homepage palette ── */
const GOLD = '#D4AF37' // brand gold (matches hero / EmpathyBridge / CTA)
const INK = '#6E1023' // brand burgundy
const CHAR = '#2A2A28' // soft charcoal for body + card names

/* Generated paper texture (no photo) */
const PAPER_MOTTLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E\")"
const PAPER_TOOTH =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")"

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
    name: 'Spine & Joint',
    tagline: 'Restore mobility',
    durationMin: 60,
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=spine-joint',
  },
  {
    slug: 'hair-skin',
    name: 'Hair & Skin',
    tagline: 'Glow from within',
    durationMin: 50,
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=hair-skin',
  },
  {
    slug: 'post-delivery',
    name: 'Post-Delivery',
    tagline: 'For new mothers',
    durationMin: 75,
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=post-delivery',
  },
  {
    slug: 'de-stress',
    name: 'De-Stress',
    tagline: 'Quiet the mind',
    durationMin: 45,
    image:
      'https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&w=900&q=80',
    href: '/treatments?category=de-stress',
  },
  {
    slug: 'panchakarma',
    name: 'Panchakarma',
    tagline: 'Five-stage detox',
    durationMin: 90,
    image: '/Ayurvedic-wellness-flat-lay-arrangement-1024x683.png',
    href: '/treatments?category=panchakarma',
  },
]

/**
 * Signature Therapies — quiet minimal-luxury.
 * Solid warm-bone paper (generated grain, no photo) framed by soft watercolor
 * leaf corners, with a calm five-up gallery carried by typography and space.
 */
export default function ClinicTherapies() {
  return (
    <section
      id="clinic-therapies"
      aria-labelledby="therapies-heading"
      className="relative overflow-hidden"
      style={{ background: '#F5EFE2' }}
    >
      {/* soft sheet of light from the top — gentle dimension */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(95% 60% at 50% -12%, rgba(255,253,248,0.75), transparent 62%)',
        }}
      />
      {/* handmade-paper tonal mottle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0.09, mixBlendMode: 'multiply', backgroundImage: PAPER_MOTTLE, backgroundSize: '640px 640px' }}
      />
      {/* fine paper tooth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0.12, mixBlendMode: 'multiply', backgroundImage: PAPER_TOOTH, backgroundSize: '180px 180px' }}
      />

      {/* watercolor leaf corners — single asset windowed to each corner, white blended out */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[100px] w-[120px] bg-[url('/leaves.jpg')] bg-[length:260px_auto] bg-right-top bg-no-repeat opacity-[0.88] mix-blend-multiply sm:h-[160px] sm:w-[190px] sm:bg-[length:430px_auto]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 hidden h-[190px] w-[210px] bg-[url('/leaves.jpg')] bg-[length:430px_auto] bg-left-bottom bg-no-repeat opacity-[0.88] mix-blend-multiply sm:block"
      />

      {/* single hairline at the top */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'rgba(42,42,40,0.10)' }} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-7 py-16 sm:px-10 lg:px-12 lg:py-20">
        {/* ── Header — editorial, lots of air ── */}
        <motion.header
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-xl">
            <span className="font-heading text-[10px] font-medium uppercase tracking-[0.42em]" style={{ color: GOLD }}>
              At the Centre
            </span>
            <h2
              id="therapies-heading"
              className="mt-4 font-display"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', lineHeight: 1.04, color: INK, fontWeight: 400 }}
            >
              Signature <span className="italic" style={{ color: GOLD, textShadow: '0 3px 22px rgba(212,175,55,0.22)' }}>therapies</span>
            </h2>
            <p className="mt-4 max-w-md font-body text-[14px] font-light leading-[1.75]" style={{ color: 'rgba(42,42,40,0.62)' }}>
              Tailored to your dosha and performed by experienced therapists from Kerala — a small, considered collection.
            </p>
          </div>

          <Link
            href="/treatments"
            className="group inline-flex items-center gap-2 self-start pb-1 font-heading text-[11px] font-medium uppercase tracking-[0.24em] sm:self-end"
            style={{ color: CHAR }}
          >
            <span className="relative">
              View all therapies
              <span className="absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-500 group-hover:w-full" style={{ background: GOLD }} />
            </span>
            <span className="opacity-60 transition-transform duration-300 group-hover:translate-x-1" style={{ color: GOLD }}>→</span>
          </Link>
        </motion.header>

        {/* ── The collection — one quiet row of five ── */}
        <motion.ol
          variants={staggerParent(0.06, 0.12)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mt-12 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:mt-16 lg:grid-cols-5 lg:gap-6"
        >
          {categories.map((cat, i) => {
            const featured = i === categories.length - 1
            return (
              <motion.li key={cat.slug} variants={fadeUp(0)} className="card group">
                <Link href={cat.href} className="block focus:outline-none" aria-label={`${cat.name} — ${cat.tagline}`}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[3px]">
                    <Image
                      src={cat.image}
                      alt={`${cat.name} — ${cat.tagline}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      style={{ filter: 'saturate(0.94) contrast(0.98) brightness(1.02)' }}
                    />
                    <span
                      className="absolute left-3 top-2.5 font-display text-[13px] italic text-white/90"
                      style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {featured && (
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-[#F4F1EA]/90 px-2 py-0.5 font-heading text-[8px] font-semibold uppercase tracking-[0.14em]" style={{ color: INK }}>
                        Most loved
                      </span>
                    )}
                  </div>
                  <div className="mt-3.5 flex items-baseline justify-between gap-2">
                    <h3 className="font-heading text-[14px] font-semibold tracking-tight" style={{ color: CHAR }}>
                      {cat.name}
                    </h3>
                    <span className="font-heading text-[9.5px] font-medium uppercase tracking-[0.14em]" style={{ color: 'rgba(42,42,40,0.4)' }}>
                      {cat.durationMin}&prime;
                    </span>
                  </div>
                  <p className="mt-0.5 font-display text-[12.5px] italic" style={{ color: 'rgba(42,42,40,0.5)' }}>
                    {cat.tagline}
                  </p>
                  <span className="mt-2.5 block h-px w-7 transition-[width] duration-500 group-hover:w-full" style={{ background: GOLD }} />
                </Link>
              </motion.li>
            )
          })}
        </motion.ol>
      </div>
    </section>
  )
}
