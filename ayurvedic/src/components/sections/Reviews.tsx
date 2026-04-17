'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, ArrowUpRight } from 'lucide-react'
import { reviews } from '@/data/reviews'
import {
  fadeUp,
  clipReveal,
  staggerParent,
  inViewOnce,
  EASE_OUT_PREMIUM,
} from '@/lib/motion'

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=Kerala+Ayurvedic+Lifestyle+Brickfields+KL+reviews'

const hero = reviews[0]
const supporting = [reviews[1], reviews[2]]
const totalReviews = reviews.length

const hairline = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.9, delay: 0.25, ease: EASE_OUT_PREMIUM },
  },
}

const glyph = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 0.15,
    y: 0,
    transition: { duration: 1.1, delay: 0.4, ease: EASE_OUT_PREMIUM },
  },
}

export default function Reviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="grain-overlay relative isolate overflow-hidden bg-heroCream py-20 lg:min-h-[calc(100vh-72px)] lg:py-[88px]"
    >
      {/* Atmospheric radial gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 55% at 18% 38%, rgba(47,93,80,0.05), transparent 65%), radial-gradient(ellipse 42% 42% at 86% 72%, rgba(212,163,115,0.07), transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-col justify-center px-6 sm:px-8 lg:px-12">
        {/* Masthead */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col items-center text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-heading text-[11px] font-semibold uppercase tracking-[0.42em] text-primary/75">
            <span>Words of Trust</span>
            <span aria-hidden className="h-[3px] w-[3px] rotate-45 bg-accent" />
            <span className="flex items-center gap-2.5">
              <span className="flex items-center gap-[2px]" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-[13px] w-[13px]"
                    fill="#D4A373"
                    stroke="none"
                  />
                ))}
              </span>
              <span className="tabular-nums tracking-[0.3em] text-primary">
                5.0
              </span>
            </span>
            <span aria-hidden className="h-[3px] w-[3px] rotate-45 bg-accent" />
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 48 48"
                aria-hidden
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>Google Reviews</span>
            </span>
          </div>

          <motion.h2
            id="reviews-heading"
            variants={fadeUp(0.1)}
            className="mt-7 font-heading font-light text-primary"
            style={{
              fontSize: 'clamp(2.5rem, 4.2vw, 4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Guest Experiences
          </motion.h2>

          {/* Diamond hairline */}
          <div className="mt-6 flex items-center gap-3" aria-hidden>
            <motion.span
              variants={hairline}
              className="block h-px w-14 origin-right bg-accent/60"
            />
            <motion.span
              variants={fadeUp(0.35)}
              className="block h-[5px] w-[5px] rotate-45 bg-accent"
            />
            <motion.span
              variants={hairline}
              className="block h-px w-14 origin-left bg-accent/60"
            />
          </div>
        </motion.div>

        {/* Editorial spread */}
        <div className="mt-14 grid grid-cols-1 gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* Hero pull quote */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="relative lg:col-span-7"
          >
            <motion.span
              variants={glyph}
              aria-hidden
              className="absolute -left-4 -top-20 select-none font-body italic leading-none text-accent sm:-left-8 sm:-top-24 lg:-left-10 lg:-top-28"
              style={{ fontSize: 'clamp(140px, 16vw, 220px)' }}
            >
              &ldquo;
            </motion.span>

            <motion.blockquote
              variants={clipReveal('right', 0.5)}
              className="relative z-10 font-body italic text-primary"
              style={{
                fontSize: 'clamp(22px, 2.6vw, 38px)',
                lineHeight: 1.32,
                maxWidth: '34ch',
              }}
            >
              {hero.text}
            </motion.blockquote>

            <motion.footer
              variants={fadeUp(0.75)}
              className="mt-10 flex items-baseline gap-5"
            >
              <span
                aria-hidden
                className="block h-px w-10 translate-y-[-3px] bg-primary/40"
              />
              <div>
                <h3 className="font-heading text-[12px] font-bold uppercase tracking-[0.22em] text-primary">
                  {hero.name}
                </h3>
                <p className="mt-1.5 font-body text-[11px] italic text-primary/55">
                  {hero.location}
                  {hero.treatment && (
                    <>
                      <span className="mx-2 text-accent not-italic">·</span>
                      <span className="not-italic font-heading font-semibold uppercase tracking-[0.22em] text-accent">
                        {hero.treatment}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </motion.footer>
          </motion.div>

          {/* Supporting stack */}
          <motion.div
            variants={staggerParent(0.14, 0.85)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="flex flex-col lg:col-span-5"
          >
            {supporting.map((review, i) => (
              <motion.figure
                key={review.id}
                variants={fadeUp(0)}
                className={[
                  'relative',
                  i === 0 ? 'pb-8' : 'border-t border-primary/[0.09] pt-8',
                  // Hide the second supporting quote on the smallest screens
                  i === 1 ? 'hidden sm:block' : '',
                ].join(' ')}
              >
                <blockquote
                  className="font-body italic text-primary/80"
                  style={{
                    fontSize: '16px',
                    lineHeight: 1.65,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {review.text}
                </blockquote>

                <figcaption className="mt-5 flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="block h-px w-6 translate-y-[-3px] bg-accent/70"
                  />
                  <div>
                    <h4 className="font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                      {review.name}
                    </h4>
                    <p className="mt-1 font-body text-[10px] italic text-primary/55">
                      {review.location}
                      {review.treatment && (
                        <>
                          <span className="mx-1.5 text-accent not-italic">
                            ·
                          </span>
                          <span className="not-italic font-heading font-semibold uppercase tracking-[0.22em] text-accent">
                            {review.treatment}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}

            {/* Counter + Google CTA */}
            <motion.div
              variants={fadeUp(0)}
              className="mt-10 flex items-center justify-between border-t border-primary/[0.09] pt-6"
            >
              <span className="font-heading text-[10px] font-medium uppercase tracking-[0.32em] text-primary/50 tabular-nums">
                {String(supporting.length + 1).padStart(2, '0')}
                <span className="mx-1.5 text-primary/30">/</span>
                {String(totalReviews).padStart(2, '0')} verified
              </span>

              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-primary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-4 focus-visible:ring-offset-heroCream"
              >
                <span className="relative">
                  Read all on Google
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,0.92,0.38,1)] group-hover:scale-x-100"
                  />
                </span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-accent transition-transform duration-500 ease-[cubic-bezier(0.22,0.92,0.38,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
