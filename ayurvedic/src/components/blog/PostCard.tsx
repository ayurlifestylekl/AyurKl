'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'

import { fadeUp } from '@/lib/motion'
import type { PostListItem } from '@/types/blog'

interface PostCardProps {
  post: PostListItem
  /** Optional 1-based card index used for the eyebrow numbering */
  index?: number
  total?: number
  /** Larger feature variant for the first card on the index page */
  variant?: 'default' | 'feature' | 'compact'
}

/**
 * Editorial card for the blog index and related-posts strip.
 *
 * - `default`  — three-column grid card
 * - `feature`  — large asymmetric card used for the most-recent post
 * - `compact`  — small mini-card for the bottom "Continue reading" strip
 */
export default function PostCard({
  post,
  index,
  total,
  variant = 'default',
}: PostCardProps) {
  const formattedDate = (() => {
    try {
      return format(new Date(post.publishedAt), 'd MMMM yyyy')
    } catch {
      return post.publishedAt.slice(0, 10)
    }
  })()

  if (variant === 'feature') {
    return (
      <motion.article
        variants={fadeUp(0)}
        layout
        className="group relative grid grid-cols-1 overflow-hidden rounded-[28px] bg-white ring-1 ring-primary/10 shadow-[0_2px_4px_rgba(47,93,80,0.06),0_28px_72px_-24px_rgba(47,93,80,0.22)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_4px_8px_rgba(47,93,80,0.08),0_44px_100px_-30px_rgba(47,93,80,0.28)] lg:grid-cols-12"
      >
        {/* Image */}
        <Link
          href={`/blog/${post.slug}`}
          className="relative block aspect-[4/3] overflow-hidden lg:col-span-7 lg:aspect-auto"
          aria-label={post.title}
        >
          {post.heroImageUrl ? (
            <Image
              src={post.heroImageUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/15 to-secondary/10" />
          )}
          {/* Editorial overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent mix-blend-multiply"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Featured pill */}
          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-accent/95 px-3 py-1.5 font-heading text-[9.5px] font-bold uppercase tracking-[0.18em] text-dark backdrop-blur">
            ★ Featured
          </span>
        </Link>

        {/* Text */}
        <div className="flex flex-col justify-center gap-5 p-8 sm:p-10 lg:col-span-5 lg:p-12">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              {index != null && total != null
                ? `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
                : 'Latest'}
            </span>
            <span aria-hidden className="h-px w-8 bg-accent/40" />
            <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.18em] text-primary/55">
              {formattedDate}
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 font-heading text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Link href={`/blog/${post.slug}`} className="block">
            <h2 className="font-heading text-[28px] font-extrabold leading-[1.05] tracking-[-0.022em] text-primary transition-colors duration-300 group-hover:text-primary/85 sm:text-[34px] md:text-[38px]">
              {post.title}
            </h2>
          </Link>

          {post.excerpt && (
            <p className="font-body text-[16px] leading-[1.75] text-dark/70">
              {post.excerpt}
            </p>
          )}

          {post.authorName && (
            <p className="font-heading text-[10.5px] font-bold uppercase tracking-[0.18em] text-dark/55">
              By {post.authorName}
            </p>
          )}

          <Link
            href={`/blog/${post.slug}`}
            className="group/cta mt-2 inline-flex w-fit items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-200 hover:text-accent"
          >
            <span>Read article</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              strokeWidth={2.6}
            />
          </Link>
        </div>
      </motion.article>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.article
        variants={fadeUp(0)}
        layout
        className="group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-white ring-1 ring-primary/10 shadow-[0_1px_2px_rgba(47,93,80,0.04),0_14px_36px_-18px_rgba(47,93,80,0.16)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(47,93,80,0.06),0_22px_44px_-18px_rgba(47,93,80,0.20)]"
      >
        <Link
          href={`/blog/${post.slug}`}
          className="relative block aspect-[16/10] overflow-hidden"
          aria-label={post.title}
        >
          {post.heroImageUrl ? (
            <Image
              src={post.heroImageUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/15 to-secondary/10" />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent mix-blend-multiply"
          />
        </Link>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.18em] text-primary/55">
            {formattedDate}
          </span>
          <Link href={`/blog/${post.slug}`}>
            <h3 className="font-heading text-[18px] font-extrabold leading-[1.2] tracking-[-0.018em] text-primary transition-colors duration-300 group-hover:text-primary/80">
              {post.title}
            </h3>
          </Link>
          {post.excerpt && (
            <p className="line-clamp-2 font-body text-[14px] leading-[1.7] text-dark/65">
              {post.excerpt}
            </p>
          )}
        </div>
      </motion.article>
    )
  }

  // ── default grid card ────────────────────────────────────────────
  return (
    <motion.article
      variants={fadeUp(0)}
      layout
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-primary/10 shadow-[0_1px_2px_rgba(47,93,80,0.04),0_18px_44px_-22px_rgba(47,93,80,0.18)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(47,93,80,0.06),0_32px_64px_-22px_rgba(47,93,80,0.24)]"
    >
      {/* Top accent strip */}
      <div
        aria-hidden
        className="h-[3px] w-full bg-gradient-to-r from-primary via-secondary to-accent"
      />

      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={post.title}
      >
        {post.heroImageUrl ? (
          <Image
            src={post.heroImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/15 to-secondary/10" />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent mix-blend-multiply"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-7">
        {/* Eyebrow row: number + date */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary/55">
            {index != null && total != null && (
              <>
                <span className="text-accent">{String(index).padStart(2, '0')}</span>
                <span className="mx-1.5 text-primary/30">/</span>
                <span>{String(total).padStart(2, '0')}</span>
              </>
            )}
          </span>
          <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.18em] text-primary/55">
            {formattedDate}
          </span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 font-heading text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-heading text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em] text-primary transition-colors duration-300 group-hover:text-primary/85 sm:text-[24px]">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="line-clamp-3 font-body text-[15px] leading-[1.7] text-dark/70">
            {post.excerpt}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-primary/10 pt-5">
          {post.authorName && (
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-dark/55">
              By {post.authorName}
            </span>
          )}
          <Link
            href={`/blog/${post.slug}`}
            className="group/cta inline-flex items-center gap-1.5 font-heading text-[10.5px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-200 hover:text-accent"
          >
            <span>Read</span>
            <ArrowUpRight
              className="h-3 w-3 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              strokeWidth={2.6}
            />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
