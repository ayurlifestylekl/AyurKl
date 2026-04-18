'use client'

import React from 'react'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface WaxSealProps {
  size?: Size
  label?: string
  subLabel?: string
  tone?: 'gold' | 'crimson'
  rotate?: boolean
  tiltOnHover?: boolean
  className?: string
  /** Renders the seal as an inert decorative disc (no interactions). */
  decorative?: boolean
}

const SIZES: Record<Size, { px: number; innerPx: number; fontPx: number; subFontPx: number; arcFontPx: number }> = {
  sm: { px: 58,  innerPx: 40, fontPx: 13, subFontPx: 7.5, arcFontPx: 6 },
  md: { px: 86,  innerPx: 60, fontPx: 18, subFontPx: 9,   arcFontPx: 7.5 },
  lg: { px: 120, innerPx: 84, fontPx: 26, subFontPx: 10.5, arcFontPx: 8.5 },
  xl: { px: 156, innerPx: 110, fontPx: 34, subFontPx: 11.5, arcFontPx: 9.5 },
}

/**
 * Hand-pressed wax-seal disc. Used for the rotating hero seal, the
 * postscript signoff, and the "SEAL & SEND" submit button in the
 * letterhead desk. Transform/opacity only — no layout shifts.
 */
export default function WaxSeal({
  size = 'md',
  label = 'KAL',
  subLabel,
  tone = 'gold',
  rotate = false,
  tiltOnHover = false,
  className = '',
  decorative = false,
}: WaxSealProps) {
  const s = SIZES[size]
  const radius = s.px / 2
  const arcRadius = radius - 8

  const discBg =
    tone === 'gold'
      ? 'radial-gradient(circle at 32% 28%, #F3D9A8 0%, #D4A373 42%, #A5753F 92%, #6E4A22 100%)'
      : 'radial-gradient(circle at 32% 28%, #D98883 0%, #8E2E26 48%, #4C1610 100%)'

  const innerRing =
    tone === 'gold'
      ? 'radial-gradient(circle at 40% 32%, rgba(255, 240, 214, 0.55) 0%, transparent 55%), radial-gradient(circle at 60% 70%, rgba(64,36,14,0.35) 0%, transparent 65%)'
      : 'radial-gradient(circle at 40% 32%, rgba(255,210,205,0.45) 0%, transparent 55%), radial-gradient(circle at 60% 70%, rgba(40,10,8,0.55) 0%, transparent 65%)'

  // Circular arc text path — a full circle centered in the viewBox.
  const pathId = `wax-arc-${size}-${Math.random().toString(36).slice(2, 7)}`

  return (
    <div
      aria-hidden={decorative ? true : undefined}
      className={`relative inline-flex items-center justify-center ${
        tiltOnHover ? 'transition-transform duration-500 ease-out hover:rotate-[4deg]' : ''
      } ${className}`}
      style={{
        width: s.px,
        height: s.px,
        willChange: 'transform',
      }}
    >
      {/* Outer shadow (embossed drop) */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow:
            tone === 'gold'
              ? '0 14px 28px -10px rgba(110,74,34,0.55), 0 4px 10px rgba(64,36,14,0.35), inset 0 2px 3px rgba(255,240,214,0.55), inset 0 -3px 5px rgba(64,36,14,0.45)'
              : '0 14px 28px -10px rgba(76,22,16,0.55), 0 4px 10px rgba(40,10,8,0.35), inset 0 2px 3px rgba(255,220,218,0.45), inset 0 -3px 5px rgba(40,10,8,0.5)',
        }}
      />

      {/* Rotating disc wrapper — gives the wax its slow turn */}
      <div
        className={`relative h-full w-full rounded-full ${rotate ? 'wax-rotate' : ''}`}
        style={{
          background: discBg,
          willChange: rotate ? 'transform' : undefined,
        }}
      >
        {/* Inner highlight + shading */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: innerRing, mixBlendMode: 'overlay' }}
        />

        {/* Deckled edge — subtle scalloped bite */}
        <svg
          aria-hidden
          viewBox={`0 0 ${s.px} ${s.px}`}
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <path
              id={pathId}
              d={`M ${radius},${radius} m -${arcRadius},0 a ${arcRadius},${arcRadius} 0 1,1 ${
                arcRadius * 2
              },0 a ${arcRadius},${arcRadius} 0 1,1 -${arcRadius * 2},0`}
              fill="none"
            />
          </defs>

          {/* Arc text (only when subLabel provided) */}
          {subLabel && (
            <text
              fontFamily="var(--font-montserrat), sans-serif"
              fontWeight="700"
              fontSize={s.arcFontPx}
              letterSpacing={s.arcFontPx * 0.35}
              fill={tone === 'gold' ? '#3C2411' : '#F2D4D0'}
              style={{ textTransform: 'uppercase' }}
            >
              <textPath href={`#${pathId}`} startOffset="0">
                {subLabel}
              </textPath>
            </text>
          )}

          {/* Concentric hairline — engraves a thin circle */}
          <circle
            cx={radius}
            cy={radius}
            r={s.innerPx / 2}
            fill="none"
            stroke={tone === 'gold' ? 'rgba(60,36,17,0.55)' : 'rgba(255,220,218,0.4)'}
            strokeWidth="0.8"
          />
        </svg>

        {/* Center label (monogram) */}
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontWeight: 800,
            fontSize: s.fontPx,
            letterSpacing: '-0.02em',
            color: tone === 'gold' ? '#2B1A0A' : '#FBE3E0',
            textShadow:
              tone === 'gold'
                ? '0 1px 0 rgba(255,240,214,0.4), 0 -1px 0 rgba(40,20,6,0.45)'
                : '0 1px 0 rgba(255,220,218,0.3), 0 -1px 0 rgba(20,4,2,0.5)',
            transform: 'translateY(1px)',
          }}
        >
          {label}
        </span>

        {/* Stem-punch detail — tiny emboss above label */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[18%] h-[3px] w-[14%] -translate-x-1/2 rounded-full"
          style={{
            background:
              tone === 'gold'
                ? 'linear-gradient(180deg, rgba(255,240,214,0.55) 0%, rgba(110,74,34,0.25) 100%)'
                : 'linear-gradient(180deg, rgba(255,220,218,0.5) 0%, rgba(40,10,8,0.3) 100%)',
          }}
        />
      </div>

      <style jsx>{`
        .wax-rotate {
          animation: wax-rotate 48s linear infinite;
        }
        @keyframes wax-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wax-rotate {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
