'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Volume2, VolumeX } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

type VideoTestimonial = {
  id: string
  chapter: string        // roman numeral, e.g. 'I'
  videoSrc: string
  posterImage: string
  author: string
  ritual: string         // editorial line, e.g. 'Shirodhara — 21 days'
  location: string
  duration: string       // 'mm:ss' shown on the play marker
}

const testimonials: VideoTestimonial[] = [
  {
    id: 'andrea',
    chapter: 'I',
    videoSrc: '/videos/andrea.mp4',
    posterImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    author: 'Andrea',
    ritual: 'Shirodhara — 21 days',
    location: 'Kuala Lumpur',
    duration: '01:24',
  },
  {
    id: 'liliana',
    chapter: 'II',
    videoSrc: '/videos/liliana.mp4',
    posterImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    author: 'Liliana',
    ritual: 'Abhyanga ritual',
    location: 'Petaling Jaya',
    duration: '01:48',
  },
  {
    id: 'mani',
    chapter: 'III',
    videoSrc: '/videos/mani.mp4',
    posterImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    author: 'Mani',
    ritual: 'Panchakarma cleanse',
    location: 'Penang',
    duration: '02:12',
  },
  {
    id: 'yoshie',
    chapter: 'IV',
    videoSrc: '/videos/yoshie.mp4',
    posterImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
    author: 'Yoshie',
    ritual: 'Netra tarpana',
    location: 'Bangsar',
    duration: '00:58',
  },
]

export default function VideoTestimonials() {
  return (
    <section className="grain-overlay-dark relative overflow-hidden bg-nearBlackGreen py-14 sm:py-16 lg:py-20">
      {/* Atmospheric layers — herbal halo + warm gold wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(47,93,80,0.55), transparent 62%), radial-gradient(circle 42% at 92% 108%, rgba(212,163,115,0.14), transparent 62%), radial-gradient(ellipse 60% 40% at 8% 50%, rgba(47,93,80,0.18), transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* ─────────────────────────  EDITORIAL HEADER  ───────────────────────── */}
        <motion.header
          variants={staggerParent(0.09, 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0"
        >
          {/* Left column — eyebrow + display headline */}
          <div className="lg:col-span-7 lg:pr-6">
            <motion.div variants={fadeUp(0)} className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-px w-10 bg-accent/60"
              />
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.42em] text-accent">
                The Guest Film <span className="mx-1 text-accent/40">·</span> Vol. I
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp(0)}
              className="mt-6 font-heading text-[clamp(2.4rem,5.2vw,4.6rem)] font-light leading-[0.98] tracking-[-0.02em] text-white/95"
            >
              Quiet rituals,
              <br />
              <span className="font-body italic font-normal text-accent">
                remembered.
              </span>
            </motion.h2>
          </div>

          {/* Right column — sub copy + caption + hairline anchor */}
          <div className="relative lg:col-span-5 lg:pl-10">
            {/* Hairline divider — vertical on desktop, horizontal on mobile */}
            <span
              aria-hidden
              className="absolute left-0 top-0 hidden h-full w-px bg-gradient-to-b from-accent/40 via-accent/15 to-transparent lg:block"
            />

            <motion.p
              variants={fadeUp(0)}
              className="font-body text-[15px] leading-[1.75] text-white/70 sm:text-[16px] lg:mt-3"
            >
              Four guests. Four journeys under{' '}
              <span className="text-white/90">Vaidya Akhil&rsquo;s</span> care at our
              Brickfields sanctuary — filmed in stillness, with nothing added.
            </motion.p>

            <motion.div
              variants={fadeUp(0)}
              className="mt-7 flex items-center gap-3"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.36em] text-white/50">
                Filmed Spring 2026 · Brickfields, KL
              </span>
            </motion.div>
          </div>
        </motion.header>

        {/* Hairline that anchors the header to the reel */}
        <motion.div
          variants={fadeUp(0.25)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          aria-hidden
          className="mt-14 h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent lg:mt-16"
        />

        {/* ─────────────────────────  FILM REEL  ───────────────────────── */}
        <motion.div
          variants={staggerParent(0.09, 0.15)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="no-scrollbar -mx-5 mt-12 flex w-[calc(100%+2.5rem)] gap-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory sm:mx-0 sm:w-full sm:gap-6 sm:px-0 lg:mt-14 lg:grid lg:grid-cols-4 xl:gap-7 lg:pb-0"
        >
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.id}
              variants={fadeUp(0)}
              className="w-[268px] flex-shrink-0 snap-center sm:w-[290px] lg:w-auto"
            >
              <VideoCard item={item} index={idx} />
            </motion.div>
          ))}
        </motion.div>

        {/* ─────────────────────────  PROGRESS RAIL  ───────────────────────── */}
        <motion.div
          variants={fadeUp(0.4)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative mt-14 hidden lg:block"
        >
          <span
            aria-hidden
            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent/25 to-transparent"
          />
          <ul className="relative flex items-center justify-between">
            {testimonials.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 bg-nearBlackGreen px-4"
              >
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-accent/70"
                />
                <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.34em] text-white/55">
                  {item.chapter}
                  <span className="mx-2 text-accent/40">·</span>
                  {item.author}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

function VideoCard({ item, index }: { item: VideoTestimonial; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <article className="group relative flex flex-col">
      {/* ── 9:16 cinematic frame ── */}
      <div
        className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[14px] bg-black ring-1 ring-white/10 transition-[transform,box-shadow,ring] duration-700 ease-[cubic-bezier(0.22,0.92,0.38,1)] will-change-transform hover:-translate-y-2 hover:ring-accent/35"
        onClick={togglePlay}
        style={{
          boxShadow:
            '0 24px 60px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <video
          ref={videoRef}
          src={item.videoSrc}
          poster={item.posterImage}
          playsInline
          loop
          muted={isMuted}
          preload="none"
          className={`h-full w-full object-cover transition-[transform,opacity,filter] duration-[1800ms] ease-out ${
            isPlaying
              ? 'scale-100 opacity-100'
              : 'scale-[1.04] opacity-85 group-hover:scale-[1.015] group-hover:opacity-100'
          }`}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Color treatment + cinematic vignette */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 transition-opacity duration-700 ${
            isPlaying ? 'opacity-30' : 'opacity-90'
          }`}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 70% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)',
            opacity: isPlaying ? 0.25 : 0.7,
            transition: 'opacity 700ms ease',
          }}
        />

        {/* Hover gold rim — kept ultra-subtle so it doesn't shout */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            boxShadow:
              '0 0 0 1px rgba(212,163,115,0.28), 0 30px 60px -24px rgba(212,163,115,0.18)',
          }}
        />

        {/* ── Chapter badge — top-left ── */}
        <div
          className={`absolute left-5 top-5 z-10 flex flex-col gap-1 transition-all duration-700 ${
            isPlaying
              ? 'translate-y-[-6px] opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.5em] text-accent">
            Film
          </span>
          <span className="font-heading text-[20px] font-light leading-none tracking-[-0.04em] text-white/95">
            {String(index + 1).padStart(2, '0')}
            <span className="mx-1 text-white/30">/</span>
            <span className="text-white/40">04</span>
          </span>
        </div>

        {/* ── Refined play marker (centered) ── */}
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 transition-all duration-700 ease-out ${
            isPlaying
              ? 'scale-110 opacity-0'
              : 'scale-100 opacity-100 group-hover:gap-4'
          }`}
        >
          <div className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full border border-accent/45 bg-black/30 backdrop-blur-md transition-all duration-500 group-hover:border-accent group-hover:bg-black/40">
            {/* Inner concentric ring for depth */}
            <span
              aria-hidden
              className="absolute inset-[5px] rounded-full border border-white/10"
            />
            <Play
              className="ml-[3px] h-4 w-4 fill-white/95 text-white/95 transition-transform duration-500 group-hover:scale-110"
              strokeWidth={1}
            />
          </div>
          <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.4em] text-white/65 transition-colors duration-500 group-hover:text-accent">
            Play film <span className="mx-1 text-white/30 group-hover:text-accent/50">·</span> {item.duration}
          </span>
        </div>

        {/* ── Bottom text stack ── */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-7 transition-all duration-700 ease-out ${
            isPlaying
              ? 'translate-y-6 opacity-0'
              : 'translate-y-0 opacity-100 group-hover:-translate-y-1'
          }`}
        >
          {/* Hairline above name on hover */}
          <span
            aria-hidden
            className="mb-3 block h-px w-6 origin-left scale-x-0 bg-accent/70 transition-transform duration-500 group-hover:scale-x-100"
          />
          <h3 className="font-heading text-[26px] font-normal leading-none tracking-[-0.01em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {item.author}
          </h3>
          <p className="mt-2 font-body text-[13px] italic leading-snug text-accent/90">
            {item.ritual}
          </p>
          <p className="mt-2 font-heading text-[10px] font-medium uppercase tracking-[0.32em] text-white/55">
            {item.location}
          </p>
        </div>

        {/* ── Audio toggle (only while playing) ── */}
        {isPlaying && (
          <button
            onClick={toggleMute}
            className="absolute bottom-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/70 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </article>
  )
}
