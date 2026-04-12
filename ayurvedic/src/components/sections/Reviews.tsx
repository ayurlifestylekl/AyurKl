'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { reviews } from '@/data/reviews'
import { EASE_OUT_PREMIUM, fadeUp, inViewOnce } from '@/lib/motion'

/**
 * Cinematic single-review stage on dark immersive background.
 * Auto-rotates every 6s with crossfade. Pauses on hover.
 */
export default function Reviews() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setActive(prev => (prev + 1) % reviews.length)
  }, [])

  // Auto-rotation
  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [paused, next])

  const review = reviews[active]

  return (
    <section
      aria-labelledby="reviews-heading"
      className="relative overflow-hidden bg-nearBlackGreen grain-overlay-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 md:py-28">
        {/* Header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-10"
        >
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent/70">
            Real Experiences
          </span>
          <h2
            id="reviews-heading"
            className="mt-3 font-heading text-3xl font-extrabold leading-[1.1] text-white/90 sm:text-4xl"
          >
            What Our Guests Say
          </h2>
        </motion.div>

        {/* Radial gold glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 600,
            height: 400,
            background:
              'radial-gradient(ellipse at center, rgba(212,163,115,0.06) 0%, transparent 65%)',
          }}
          aria-hidden
        />

        {/* Gold opening quote */}
        <svg
          className="mb-6"
          width="48"
          height="36"
          viewBox="0 0 36 28"
          fill="none"
          aria-hidden
          style={{ opacity: 0.15 }}
        >
          <path
            d="M0 17.5C0 10 4.5 3.5 12 0L14 3.5C8 6.5 6 10.5 5.5 13.5H12V28H0V17.5ZM22 17.5C22 10 26.5 3.5 34 0L36 3.5C30 6.5 28 10.5 27.5 13.5H34V28H22V17.5Z"
            fill="#D4A373"
          />
        </svg>

        {/* Stars */}
        <div className="mb-6 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4"
              fill="#D4A373"
              stroke="none"
            />
          ))}
        </div>

        {/* Review content — crossfade */}
        <div className="relative min-h-[160px] w-full max-w-[720px] sm:min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE_OUT_PREMIUM }}
            >
              {/* Quote */}
              <blockquote className="font-body text-[18px] italic leading-[1.65] text-white/75 sm:text-[22px] md:text-[26px] md:leading-[1.55]">
                &ldquo;{review.text}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="mt-6 flex flex-col items-center gap-1">
                <p className="font-heading text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">
                  {review.name}
                </p>
                <p className="font-body text-[11px] text-white/35">
                  {review.location}
                  {review.treatment && (
                    <span className="ml-2 text-accent/50">
                      · {review.treatment}
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div className="mt-10 flex items-center gap-2.5" role="tablist">
          {reviews.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Review by ${r.name}`}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-nearBlackGreen ${
                i === active
                  ? 'w-6 bg-accent'
                  : 'w-2 bg-white/20 hover:bg-white/35'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
