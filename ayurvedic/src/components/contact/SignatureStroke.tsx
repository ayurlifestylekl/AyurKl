'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface SignatureStrokeProps {
  /** Stroke color — defaults to a dark primary ink. */
  color?: string
  /** Pixel width of the wrapping box. Height scales proportionally. */
  width?: number
  /** Scroll-triggered reveal (in view). If false, strokes immediately. */
  inView?: boolean
  /** Stroke weight in SVG units. */
  strokeWidth?: number
  className?: string
}

/**
 * Vaidya AKHIL's "handwritten" signature, rendered as SVG paths that
 * stroke in via stroke-dashoffset. Two paths (body + underscore flourish)
 * animate with a staggered delay to feel penned live, not printed.
 */
export default function SignatureStroke({
  color = '#1a2e26',
  width = 260,
  inView = true,
  strokeWidth = 1.8,
  className = '',
}: SignatureStrokeProps) {
  const reduced = useReducedMotion()

  // Each path length is an approximation — actual measurement happens via
  // pathLength="1" so the stroke-dashoffset animates reliably 0→1.
  const mainPath =
    'M 6 38 C 14 18, 24 18, 28 38 S 40 58, 46 38 M 52 30 C 58 22, 64 22, 68 30 L 70 44 M 74 34 Q 80 26, 86 34 T 98 34 M 104 20 L 104 46 M 110 32 Q 118 22, 126 32 Q 118 46, 110 40 M 132 36 Q 140 20, 148 36 T 164 36 M 170 38 L 176 26 L 182 38 M 188 36 Q 196 28, 204 34 Q 214 46, 220 34 M 228 32 Q 236 24, 244 32'

  const flourishPath =
    'M 12 54 Q 80 62, 160 54 Q 200 50, 248 60'

  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: 1,
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 260 70"
      width={width}
      className={className}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <motion.path
        d={mainPath}
        {...common}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: reduced ? 0 : 1 }}
        whileInView={{ strokeDashoffset: 0 }}
        animate={inView ? undefined : { strokeDashoffset: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: reduced ? 0 : 1.6, ease: [0.4, 0.1, 0.3, 1] }}
      />
      <motion.path
        d={flourishPath}
        {...common}
        strokeWidth={strokeWidth * 0.8}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: reduced ? 0 : 1, opacity: 0.75 }}
        whileInView={{ strokeDashoffset: 0, opacity: 0.75 }}
        animate={inView ? undefined : { strokeDashoffset: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: reduced ? 0 : 1.0, delay: reduced ? 0 : 1.1, ease: [0.4, 0.1, 0.3, 1] }}
      />
    </svg>
  )
}
