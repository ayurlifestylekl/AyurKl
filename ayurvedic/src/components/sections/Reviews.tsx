'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import { reviews, type Review } from '@/data/reviews'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

/* ─── Star rating row ───────────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < rating ? '#D4A373' : 'transparent'}
          stroke={i < rating ? '#D4A373' : '#D4A373'}
          strokeWidth={i < rating ? 0 : 1.5}
          style={{ opacity: i < rating ? 1 : 0.25 }}
        />
      ))}
    </div>
  )
}

/* ─── Avatar initials ───────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-heading text-[12px] font-bold tracking-wide text-white"
      style={{
        background: 'linear-gradient(135deg, #2F5D50 0%, #3d7a66 100%)',
        boxShadow: '0 4px 12px rgba(47,93,80,0.3)',
      }}
    >
      {initials}
    </div>
  )
}

/* ─── Review Card ───────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      variants={fadeUp()}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 240, damping: 22 } }}
      className="group relative flex flex-col justify-between rounded-3xl bg-white p-7 ring-1 ring-dark/5"
      style={{
        boxShadow: '0 8px 30px -10px rgba(47,93,80,0.15), 0 2px 8px rgba(47,93,80,0.05)',
        minWidth: 300,
      }}
    >
      {/* Gold quote watermark */}
      <svg
        className="pointer-events-none absolute right-5 top-5"
        width="36"
        height="28"
        viewBox="0 0 36 28"
        fill="none"
        aria-hidden
        style={{ opacity: 0.06 }}
      >
        <path
          d="M0 17.5C0 10 4.5 3.5 12 0L14 3.5C8 6.5 6 10.5 5.5 13.5H12V28H0V17.5ZM22 17.5C22 10 26.5 3.5 34 0L36 3.5C30 6.5 28 10.5 27.5 13.5H34V28H22V17.5Z"
          fill="#D4A373"
        />
      </svg>

      <div>
        <StarRating rating={review.rating} />

        {/* Quote text */}
        <blockquote className="mt-4 font-body text-[15px] italic leading-[1.7] text-dark/75">
          &ldquo;{review.text}&rdquo;
        </blockquote>
      </div>

      {/* Author row */}
      <div className="mt-6 flex items-center gap-3 border-t border-dark/5 pt-5">
        <Avatar name={review.name} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[13px] font-bold text-dark">{review.name}</p>
          <p className="font-body text-[11px] text-dark/50">{review.location}</p>
        </div>
        {review.treatment && (
          <span className="flex-shrink-0 rounded-full bg-primary/8 px-3 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
            {review.treatment}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Main Section ──────────────────────────────────────── */
export default function Reviews() {
  return (
    <SectionWrapper
      eyebrow="Real Experiences"
      title="What Our Guests Say"
      subtitle="Hear from guests who discovered lasting wellness through authentic Kerala Ayurveda in Brickfields."
    >
      {/* Desktop: 3-col grid */}
      <motion.div
        variants={staggerParent(0.1)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </motion.div>

      {/* Mobile: horizontal snap carousel */}
      <motion.div
        variants={staggerParent(0.08)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar md:hidden"
      >
        {reviews.map(review => (
          <div key={review.id} className="snap-start flex-shrink-0" style={{ width: '85vw', maxWidth: 340 }}>
            <ReviewCard review={review} />
          </div>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
