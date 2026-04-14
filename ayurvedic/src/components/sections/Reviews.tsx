'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { reviews } from '@/data/reviews'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

export default function Reviews() {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="relative overflow-hidden bg-[#F8F6F0] py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-12 flex flex-col items-center text-center lg:mb-16"
        >
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
            Words of Trust
          </span>
          <h2
            id="reviews-heading"
            className="mt-4 font-heading text-[clamp(2.2rem,3vw,3.5rem)] font-light leading-[1.1] tracking-wide text-primary"
          >
            Guest Experiences
          </h2>
          <div className="mt-6 h-px w-10 bg-accent/40" aria-hidden />
        </motion.div>

        {/* Scrollable Grid */}
        <motion.div
          variants={staggerParent(0.05, 0.1)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-8 snap-x snap-mandatory sm:mx-0 sm:gap-6 sm:px-0 lg:grid lg:grid-cols-3 xl:gap-8 lg:pb-0"
        >
          {reviews.map((review) => (
            <motion.article
              key={review.id}
              variants={fadeUp(0)}
              className="group relative flex w-[300px] flex-shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[14px] border border-[#EAE6D7] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-700 ease-[cubic-bezier(0.22,0.92,0.38,1)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-accent/40 sm:w-[340px] lg:w-auto lg:h-full"
            >
              <div className="flex flex-col h-full">
                {/* Top Row: Stars + Google Icon */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-[2px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-[14px] w-[14px]"
                        fill="#D4A373"
                        stroke="none"
                      />
                    ))}
                  </div>
                  {/* Minimal Google G logo */}
                  <div className="flex items-center justify-center rounded-full bg-[#F8F6F0] p-1.5 opacity-80 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:bg-white group-hover:shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 48 48"
                      aria-label="Google Review"
                    >
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </div>
                </div>

                {/* Review Text */}
                <blockquote className="relative z-10 mb-8 flex-grow font-body text-[15px] italic leading-[1.8] text-primary/80">
                  <span className="absolute -left-3 -top-3 -z-10 font-heading text-[60px] text-accent/10 leading-none group-hover:text-accent/15 transition-colors duration-500">
                    &ldquo;
                  </span>
                  {review.text}
                </blockquote>

                {/* Bottom Row: User Info */}
                <div className="mt-auto border-t border-[#EAE6D7]/60 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-primary">
                        {review.name}
                      </h3>
                      <p className="mt-1 font-body text-[10px] font-medium uppercase tracking-[0.2em] text-primary/50">
                        {review.location}
                      </p>
                    </div>
                    {/* Optional treatment badge */}
                    {review.treatment && (
                      <span className="rounded bg-[#F8F6F0] px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-widest text-accent transition-colors duration-500 group-hover:bg-accent/10">
                        {review.treatment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
