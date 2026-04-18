'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Phone } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import LocalTimeClock from './LocalTimeClock'
import { EASE_OUT_PREMIUM, inViewOnce } from '@/lib/motion'

const HOURS_L: Array<{ day: string; time: string }> = [
  { day: 'Monday',    time: '9:00 – 19:00' },
  { day: 'Tuesday',   time: '9:00 – 19:00' },
  { day: 'Wednesday', time: '9:00 – 19:00' },
  { day: 'Thursday',  time: '9:00 – 19:00' },
]

const HOURS_R: Array<{ day: string; time: string }> = [
  { day: 'Friday',   time: '9:00 – 19:00' },
  { day: 'Saturday', time: '9:00 – 19:00' },
  { day: 'Sunday',   time: 'Closed' },
]

const MAP_EMBED_URL =
  'https://maps.google.com/maps?q=Kerala+Ayurvedic+Lifestyle,+37+Jalan+Thamby+Abdullah+1,+Brickfields,+Kuala+Lumpur&ll=3.1269091,101.6812077&z=17&hl=en&output=embed'

/**
 * A hand-drawn atlas page for Brickfields. Diagonal gold hairline
 * divides the composition — map above, address + live clock below.
 * Official Google iframe is demoted to a small "coordinates" inset
 * so the artisan sketch carries the page. Compass rose oscillates.
 */
export default function BrickfieldsAtlas() {
  return (
    <section
      aria-labelledby="atlas-heading"
      className="relative overflow-hidden bg-cream"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 5% 20%, rgba(212,163,115,0.15) 0%, transparent 55%), radial-gradient(ellipse at 95% 85%, rgba(47,93,80,0.1) 0%, transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Diagonal gold hairline — draws in on scroll */}
      <svg
        aria-hidden
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 right-0 top-[44%] h-[180px] w-full"
      >
        <defs>
          <linearGradient id="atlas-diagonal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(212,163,115,0)" />
            <stop offset="18%" stopColor="rgba(212,163,115,0.75)" />
            <stop offset="82%" stopColor="rgba(212,163,115,0.75)" />
            <stop offset="100%" stopColor="rgba(212,163,115,0)" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0"
          y1="170"
          x2="1440"
          y2="30"
          stroke="url(#atlas-diagonal)"
          strokeWidth="1.2"
          strokeLinecap="round"
          pathLength="1"
          initial={{ strokeDasharray: '1 1', strokeDashoffset: 1 }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 1.6, ease: EASE_OUT_PREMIUM }}
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 md:py-18 lg:px-12">
        {/* Section header — split into a 2-column top bar so it's tighter */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.65, ease: EASE_OUT_PREMIUM }}
          className="mb-8 grid grid-cols-1 items-end gap-6 md:mb-10 md:grid-cols-12 md:gap-10"
        >
          <div className="flex flex-col gap-3 md:col-span-7">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Folio XV · Cartography of the quarter
            </span>
            <h2
              id="atlas-heading"
              className="font-heading text-[36px] font-extrabold leading-[1.02] tracking-[-0.023em] text-primary md:text-[48px]"
            >
              A hand-drawn atlas of
              <br />
              <span className="font-body italic font-normal text-accent">
                where we are.
              </span>
            </h2>
          </div>
          <p className="font-body text-[15px] leading-[1.7] text-dark/65 md:col-span-5 md:text-[16px]">
            Five minutes from KL Sentral on foot — through the temple quarter,
            past the kolam pavements, into a shophouse where camphor and
            neem oil meet.
          </p>
        </motion.div>

        {/* ABOVE the diagonal — the hand-drawn map + official coordinates inset */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.9, ease: EASE_OUT_PREMIUM }}
          className="relative"
        >
          <BrickfieldsMap />

          {/* Official coordinates inset — demoted iframe top-right */}
          <div className="absolute right-2 top-2 hidden sm:block">
            <div
              className="relative bg-cream p-1.5"
              style={{
                boxShadow:
                  '0 12px 28px -10px rgba(47,93,80,0.4), 0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border border-accent/70"
              />
              <div
                className="relative overflow-hidden"
                style={{ width: 220, height: 140 }}
              >
                <iframe
                  src={MAP_EMBED_URL}
                  width="100%"
                  height="100%"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kerala Ayurvedic Lifestyle — Google Maps coordinates inset"
                  className="h-full w-full border-0 grayscale-[20%]"
                  loading="lazy"
                />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="font-heading text-[8px] font-bold uppercase tracking-[0.24em] text-primary/55">
                  Coordinates
                </span>
                <span className="font-body text-[10px] italic text-primary/65">
                  3.1269°N · 101.6812°E
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BELOW the diagonal — address, live clock, hours, CTAs */}
        <div className="relative mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-12 md:gap-10">
          {/* LEFT — address + clock */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={inViewOnce}
            transition={{ duration: 0.8, ease: EASE_OUT_PREMIUM }}
            className="flex flex-col gap-8 md:col-span-5"
          >
            <LocalTimeClock />

            <div className="flex flex-col gap-4">
              <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.3em] text-primary/55">
                Street address
              </span>
              <address className="font-body text-[19px] not-italic leading-[1.55] text-primary md:text-[21px]">
                37, Jalan Thamby Abdullah 1,
                <br />
                Brickfields, 50470
                <br />
                <span className="text-primary/70">
                  Kuala Lumpur, Wilayah Persekutuan
                </span>
              </address>
              <p className="font-body text-[13px] italic leading-[1.6] text-dark/55">
                A short walk from KL Sentral — the Brickfields temple quarter.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <CTAButton
                variant="secondary"
                size="md"
                icon={<MessageCircle className="h-4 w-4" strokeWidth={2.4} />}
                href="https://wa.me/601165043436"
                shimmer
              >
                Message on WhatsApp
              </CTAButton>
              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton
                  variant="outlineDark"
                  size="md"
                  icon={<Phone className="h-4 w-4" strokeWidth={2.4} />}
                  href="tel:+601165043436"
                  className="sm:flex-1"
                >
                  Call clinic
                </CTAButton>
                <CTAButton
                  variant="outlineDark"
                  size="md"
                  icon={<Mail className="h-4 w-4" strokeWidth={2.4} />}
                  href="mailto:info@keralaayurvedic.com"
                  className="sm:flex-1"
                >
                  Email us
                </CTAButton>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — hours ledger as a tinted admissions panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={inViewOnce}
            transition={{ duration: 0.8, ease: EASE_OUT_PREMIUM }}
            className="md:col-span-7"
          >
            <HoursLedger />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────── */
/* Hand-drawn Brickfields map                                    */
/* ──────────────────────────────────────────────────────────── */

function BrickfieldsMap() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '16 / 6',
        background:
          'linear-gradient(135deg, #F5ECD6 0%, #F8EFDA 45%, #F2E6C8 100%)',
        borderTop: '1px solid rgba(212,163,115,0.5)',
        borderBottom: '1px solid rgba(212,163,115,0.5)',
      }}
    >
      {/* Mapping paper grid — 40px graph */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(47,93,80,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(47,93,80,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      />

      {/* Foxing spots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 20%, rgba(122,80,36,0.75) 0%, transparent 4%), radial-gradient(circle at 82% 72%, rgba(122,80,36,0.65) 0%, transparent 3%), radial-gradient(circle at 64% 24%, rgba(122,80,36,0.6) 0%, transparent 2%)',
        }}
      />

      {/* SVG hand-drawn map */}
      <svg
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id="ink-wobble" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="2"
              seed="2"
            />
            <feDisplacementMap in="SourceGraphic" scale="1.3" />
          </filter>
        </defs>

        {/* Regional wash — Brickfields district outline (soft green) */}
        <path
          d="M 120 130 Q 220 90, 380 110 Q 560 130, 720 110 Q 880 90, 1020 130 Q 1080 160, 1070 260 Q 1060 380, 980 420 Q 820 470, 660 440 Q 480 410, 320 430 Q 200 440, 140 390 Q 90 320, 110 230 Q 115 170, 120 130 Z"
          fill="rgba(122,157,84,0.12)"
          stroke="rgba(122,157,84,0.55)"
          strokeWidth="1.1"
          strokeDasharray="3 3"
          filter="url(#ink-wobble)"
        />

        {/* KL Sentral — rail hub on the left */}
        <g transform="translate(180 220)">
          <rect
            x="-26"
            y="-16"
            width="52"
            height="32"
            fill="rgba(47,93,80,0.2)"
            stroke="rgba(47,93,80,0.75)"
            strokeWidth="1.2"
            filter="url(#ink-wobble)"
          />
          {/* Rail hatching */}
          <path
            d="M -40 -20 L -40 20 M -48 -16 L -48 16 M -48 -16 L -40 -16 M -48 16 L -40 16"
            stroke="rgba(47,93,80,0.75)"
            strokeWidth="1.1"
            fill="none"
          />
          <text
            x="0"
            y="-26"
            fontFamily="var(--font-lora), Georgia, serif"
            fontStyle="italic"
            fontSize="15"
            fill="#2F5D50"
            textAnchor="middle"
          >
            KL Sentral
          </text>
          <text
            x="0"
            y="32"
            fontFamily="var(--font-montserrat), sans-serif"
            fontSize="9"
            letterSpacing="2"
            fontWeight="700"
            fill="rgba(47,93,80,0.55)"
            textAnchor="middle"
          >
            TRANSIT HUB
          </text>
        </g>

        {/* Temple quarter — mid-section ornament cluster */}
        <g transform="translate(560 260)">
          {/* Temple silhouette */}
          <path
            d="M -24 10 L -24 -8 L -18 -14 L -12 -8 L -12 -18 L -6 -22 L 0 -30 L 6 -22 L 12 -18 L 12 -8 L 18 -14 L 24 -8 L 24 10 Z"
            fill="rgba(212,163,115,0.35)"
            stroke="rgba(138,90,43,0.85)"
            strokeWidth="1.2"
            filter="url(#ink-wobble)"
          />
          <text
            x="0"
            y="30"
            fontFamily="var(--font-lora), Georgia, serif"
            fontStyle="italic"
            fontSize="14"
            fill="#8A5A2B"
            textAnchor="middle"
          >
            Sri Kandaswamy Temple
          </text>
        </g>

        {/* Thamby Abdullah street — label only */}
        <g transform="translate(820 180)">
          <text
            fontFamily="var(--font-lora), Georgia, serif"
            fontStyle="italic"
            fontSize="12"
            fill="rgba(47,93,80,0.7)"
            transform="rotate(-6)"
          >
            Jln Thamby Abdullah 1
          </text>
        </g>

        {/* Dotted walking route — KL Sentral to clinic */}
        <path
          d="M 200 228 Q 280 250, 360 260 Q 460 272, 560 260 Q 660 248, 740 236 Q 820 224, 870 218"
          fill="none"
          stroke="rgba(138,90,43,0.9)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="1 6"
        />

        {/* Footprints along the path */}
        {[
          [310, 253, -6],
          [430, 265, -4],
          [560, 262, 0],
          [680, 250, 4],
          [790, 232, 8],
        ].map(([x, y, rot], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <ellipse
              cx="-3"
              cy="0"
              rx="2"
              ry="3.5"
              fill="rgba(138,90,43,0.7)"
            />
            <ellipse
              cx="3"
              cy="3"
              rx="2"
              ry="3.5"
              fill="rgba(138,90,43,0.7)"
            />
          </g>
        ))}

        {/* Walk-time callout */}
        <g transform="translate(420 300)">
          <text
            fontFamily="var(--font-lora), Georgia, serif"
            fontStyle="italic"
            fontSize="13"
            fill="rgba(138,90,43,0.95)"
            textAnchor="middle"
          >
            ~ 5 minutes on foot ~
          </text>
        </g>

        {/* Lesser streets — scribbled hairlines for flavour */}
        <path
          d="M 180 360 Q 340 380, 520 360 Q 700 340, 900 360"
          fill="none"
          stroke="rgba(47,93,80,0.28)"
          strokeWidth="0.9"
          filter="url(#ink-wobble)"
        />
        <path
          d="M 180 150 Q 340 130, 520 150 Q 700 170, 900 150"
          fill="none"
          stroke="rgba(47,93,80,0.28)"
          strokeWidth="0.9"
          filter="url(#ink-wobble)"
        />
        <path
          d="M 720 140 L 720 370"
          fill="none"
          stroke="rgba(47,93,80,0.25)"
          strokeWidth="0.9"
          filter="url(#ink-wobble)"
        />

        {/* CLINIC — you are here marker */}
        <g transform="translate(910 210)">
          {/* Pulse ring */}
          <circle
            cx="0"
            cy="0"
            r="18"
            fill="none"
            stroke="#D4A373"
            strokeWidth="1"
            opacity="0.5"
            className="atlas-pulse"
          />
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="rgba(212,163,115,0.25)"
            stroke="rgba(138,90,43,0.9)"
            strokeWidth="1.4"
          />
          <circle cx="0" cy="0" r="5" fill="#D4A373" stroke="#2B1A0A" strokeWidth="0.8" />
          <text
            x="26"
            y="-8"
            fontFamily="var(--font-lora), Georgia, serif"
            fontStyle="italic"
            fontSize="13"
            fontWeight="600"
            fill="#2F5D50"
          >
            Kerala Ayurvedic Lifestyle
          </text>
          <text
            x="26"
            y="8"
            fontFamily="var(--font-montserrat), sans-serif"
            fontSize="9"
            letterSpacing="2"
            fontWeight="700"
            fill="rgba(138,90,43,0.85)"
          >
            YOU ARE HERE · №37
          </text>
        </g>

        {/* Pavilion markers — decorative only */}
        {[
          [360, 160],
          [700, 400],
          [1000, 280],
        ].map(([x, y], i) => (
          <g key={`pav-${i}`} transform={`translate(${x} ${y})`}>
            <polygon
              points="0,-6 5,0 0,6 -5,0"
              fill="rgba(122,157,84,0.55)"
              stroke="rgba(47,93,80,0.8)"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Map title as handwritten folio */}
        <text
          x="60"
          y="70"
          fontFamily="var(--font-lora), Georgia, serif"
          fontStyle="italic"
          fontSize="20"
          fill="rgba(47,93,80,0.85)"
        >
          Brickfields
        </text>
        <text
          x="60"
          y="94"
          fontFamily="var(--font-montserrat), sans-serif"
          fontSize="9"
          letterSpacing="3"
          fontWeight="700"
          fill="rgba(47,93,80,0.5)"
        >
          NOT DRAWN TO SCALE
        </text>
      </svg>

      {/* Compass rose — bottom-left corner */}
      <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
        <CompassRose />
      </div>

      {/* Scale bar — bottom-center */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        <div className="flex">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-[4px] w-9"
              style={{
                background: i % 2 === 0 ? '#2F5D50' : '#F5ECD6',
                border: '1px solid #2F5D50',
              }}
            />
          ))}
        </div>
        <span className="font-heading text-[8.5px] font-bold uppercase tracking-[0.24em] text-primary/55">
          0 &nbsp; 50m &nbsp; 100m &nbsp; 150m &nbsp; 200m
        </span>
      </div>

      <style jsx>{`
        :global(.atlas-pulse) {
          transform-origin: center;
          animation: atlas-ring-pulse 2.2s ease-out infinite;
        }
        @keyframes atlas-ring-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.75;
          }
          80% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.atlas-pulse) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/* Compass Rose — needle oscillates gently                       */
/* ──────────────────────────────────────────────────────────── */

function CompassRose() {
  return (
    <div className="relative flex flex-col items-center gap-1.5">
      <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden>
        <defs>
          <radialGradient id="compass-face" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#FBF4E5" />
            <stop offset="80%" stopColor="#F2E6C8" />
            <stop offset="100%" stopColor="#D4A373" />
          </radialGradient>
        </defs>
        <circle cx="29" cy="29" r="27" fill="url(#compass-face)" stroke="#8A5A2B" strokeWidth="0.9" />
        <circle cx="29" cy="29" r="22" fill="none" stroke="rgba(138,90,43,0.4)" strokeWidth="0.7" />

        {/* Cardinal ticks */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={`major-${deg}`}
            x1="29"
            y1="5"
            x2="29"
            y2="9"
            stroke="#2F5D50"
            strokeWidth="1.2"
            transform={`rotate(${deg} 29 29)`}
          />
        ))}
        {[45, 135, 225, 315].map((deg) => (
          <line
            key={`minor-${deg}`}
            x1="29"
            y1="5.5"
            x2="29"
            y2="8"
            stroke="rgba(47,93,80,0.55)"
            strokeWidth="0.9"
            transform={`rotate(${deg} 29 29)`}
          />
        ))}

        <text
          x="29"
          y="15"
          fontFamily="var(--font-montserrat), sans-serif"
          fontSize="7.5"
          fontWeight="800"
          fill="#2F5D50"
          textAnchor="middle"
        >
          N
        </text>
        <text
          x="29"
          y="50"
          fontFamily="var(--font-montserrat), sans-serif"
          fontSize="7.5"
          fontWeight="700"
          fill="rgba(47,93,80,0.55)"
          textAnchor="middle"
        >
          S
        </text>
        <text
          x="48"
          y="31"
          fontFamily="var(--font-montserrat), sans-serif"
          fontSize="7.5"
          fontWeight="700"
          fill="rgba(47,93,80,0.55)"
          textAnchor="middle"
        >
          E
        </text>
        <text
          x="10"
          y="31"
          fontFamily="var(--font-montserrat), sans-serif"
          fontSize="7.5"
          fontWeight="700"
          fill="rgba(47,93,80,0.55)"
          textAnchor="middle"
        >
          W
        </text>

        {/* Needle — oscillates */}
        <g className="compass-needle" style={{ transformOrigin: '29px 29px' }}>
          <polygon points="29,9 31.8,30 29,34 26.2,30" fill="#8E2E26" stroke="#4C1610" strokeWidth="0.6" />
          <polygon points="29,49 31.8,28 29,24 26.2,28" fill="#F5ECD6" stroke="#8A5A2B" strokeWidth="0.6" />
          <circle cx="29" cy="29" r="2.4" fill="#D4A373" stroke="#8A5A2B" strokeWidth="0.7" />
        </g>
      </svg>
      <span className="font-heading text-[8.5px] font-bold uppercase tracking-[0.24em] text-primary/55">
        North by way of Jalan Tun Sambanthan
      </span>

      <style jsx>{`
        .compass-needle {
          animation: compass-sway 12s ease-in-out infinite;
        }
        @keyframes compass-sway {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .compass-needle {
            animation: none !important;
            transform: rotate(0deg) !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */

function HoursLedger() {
  return (
    <div
      className="relative overflow-hidden p-8 sm:p-10"
      style={{
        background:
          'linear-gradient(180deg, #FAF6EE 0%, #f0ede5 100%)',
        border: '1px solid rgba(212,163,115,0.45)',
        boxShadow:
          '0 22px 50px -18px rgba(47,93,80,0.35), 0 6px 14px rgba(47,93,80,0.08)',
      }}
    >
      {/* Ruled baseline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(47,93,80,0.06) 27px, rgba(47,93,80,0.06) 28px)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 10%, black 94%, transparent 100%)',
        }}
      />

      {/* Left margin rule */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-8 left-6 w-px bg-accent/35"
      />

      <div className="relative">
        <div className="mb-6 flex items-baseline justify-between border-b border-primary/15 pb-4">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.32em] text-primary/55">
            Admissions ledger
          </span>
          <span className="font-body text-[12px] italic text-primary/60">
            Folio XV · hours open
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {[HOURS_L, HOURS_R].map((col, i) => (
            <div key={i} className="flex flex-col gap-3">
              {col.map(({ day, time }) => (
                <div
                  key={day}
                  className="flex items-baseline gap-3 font-heading text-[13px] font-bold uppercase tracking-[0.14em]"
                >
                  <span className="w-28 font-body text-[15px] normal-case italic tracking-normal text-primary">
                    {day}
                  </span>
                  <span
                    aria-hidden
                    className="flex-1 translate-y-[-3px] border-b border-dotted border-primary/35"
                  />
                  <span
                    className={
                      time === 'Closed'
                        ? 'font-heading text-[11px] uppercase tracking-[0.2em] text-[#8E2E26]/75'
                        : 'text-primary'
                    }
                  >
                    {time}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-primary/15 pt-4 font-body text-[13px] italic leading-[1.6] text-dark/55">
          Consultations are by appointment — walk-ins welcome at the Ayur-Store
          during opening hours.
        </div>
      </div>
    </div>
  )
}
