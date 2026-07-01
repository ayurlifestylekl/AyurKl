'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageCircle, ArrowUpRight } from 'lucide-react'
import { fadeUp, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'
import { faqs as defaultFaqs, type FAQ } from '@/data/faqs'

interface FAQsProps {
  items?: FAQ[]
  eyebrow?: string
  title?: string
  subtitle?: string
  id?: string
}

/* ── Soft sage palette — premium Ayurvedic, distinct from cream + dark sections ── */
const BG_SAGE        = '#F6ECD6'                       // Soft dusty sage
const BG_SAGE_DEEP   = '#F6ECD6'                       // Sage gradient destination
const TEXT_DARK      = '#6E1023'                       // Emerald — high contrast on sage
const TEXT_MUTED     = 'rgba(110, 16, 35,0.70)'
const TEXT_QUIET     = 'rgba(110, 16, 35,0.55)'
const GOLD           = '#D4AF37'                       // Matches Reviews
const GOLD_SOFT      = 'rgba(212, 175, 55, 0.22)'      // Soft gold for borders + accents
const SAGE_HAIRLINE  = 'rgba(110, 16, 35,0.14)'           // Quiet emerald hairlines

export default function FAQs({
  items = defaultFaqs,
  eyebrow = 'Common Questions',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title: _title = 'Before You Book',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subtitle: _subtitle,
  id = 'faqs',
}: FAQsProps = {}) {
  const displayedItems = items.slice(0, 5)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const visibleItems = showAll ? items : displayedItems
  const hasMore = items.length > 5

  const toggle = (faqId: string) => {
    setOpenId(prev => (prev === faqId ? null : faqId))
  }

  return (
    <section
      id={id}
      aria-labelledby="faq-heading"
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
      style={{
        background: `linear-gradient(135deg, ${BG_SAGE} 0%, ${BG_SAGE_DEEP} 100%)`,
        color: TEXT_DARK,
      }}
    >
      {/* Atmospheric warm glow + subtle emerald counterpoint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 8% 12%, rgba(212, 175, 55,0.12), transparent 65%), radial-gradient(ellipse 45% 50% at 95% 88%, rgba(110, 16, 35,0.08), transparent 65%)',
        }}
      />

      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45] mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(rgba(110, 16, 35,0.08) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top + bottom gold hairlines */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent 5%, ${GOLD_SOFT} 50%, transparent 95%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent 5%, ${GOLD_SOFT} 50%, transparent 95%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-12">
        {/* ── 2-COLUMN EDITORIAL LAYOUT ── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">

          {/* ── LEFT: Title block (sticky on desktop) ── */}
          <motion.aside
            variants={fadeUp(0)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-px w-10"
                style={{ backgroundColor: GOLD, opacity: 0.7 }}
              />
              <span
                className="font-heading text-[11px] font-bold uppercase tracking-[0.36em]"
                style={{ color: GOLD }}
              >
                {eyebrow}
              </span>
            </div>

            {/* Headline — refined Playfair italic with gold accent on "Book" */}
            <h2
              id="faq-heading"
              className="mt-5 font-display"
              style={{
                fontSize: 'clamp(2.25rem, 4.4vw, 3.75rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: TEXT_DARK,
              }}
            >
              Before You{' '}
              <span
                className="italic"
                style={{
                  color: GOLD,
                  textShadow: '0 3px 22px rgba(212, 175, 55,0.22)',
                }}
              >
                Book.
              </span>
            </h2>

            {/* Body copy — dark on sage = perfect contrast */}
            <p
              className="mt-5 max-w-md font-body leading-[1.65]"
              style={{
                color: TEXT_MUTED,
                fontSize: 'clamp(15px, 1.05vw, 17px)',
              }}
            >
              The questions guests ask us most often. Still curious? Reach out — our
              team responds within the hour.
            </p>

            {/* Pull stat or quote-style line */}
            <div
              className="mt-7 flex items-start gap-3 border-l-2 pl-4"
              style={{ borderColor: GOLD }}
            >
              <p
                className="font-display italic"
                style={{
                  color: TEXT_DARK,
                  fontSize: '15px',
                  lineHeight: 1.55,
                }}
              >
                &ldquo;Our Vaidyas review every intake personally before your first session.&rdquo;
              </p>
            </div>

            {/* CTA group */}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="https://wa.me/601165043436"
                className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  backgroundColor: TEXT_DARK,
                  color: '#F7F2E8',
                  boxShadow: `0 14px 30px -14px ${TEXT_DARK}aa`,
                }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp Us
              </a>

              <a
                href="/contact"
                className="group inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.22em] transition-colors"
                style={{ color: GOLD }}
              >
                Or send an enquiry
                <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.aside>

          {/* ── RIGHT: Accordion ── */}
          <motion.div
            variants={fadeUp(0.1)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="lg:col-span-7"
          >
            {/* Top hairline */}
            <div
              className="h-px w-full"
              style={{ background: SAGE_HAIRLINE }}
              aria-hidden
            />

            {visibleItems.map((faq) => {
              const isOpen = openId === faq.id
              const panelId = `faq-panel-${faq.id}`
              const buttonId = `faq-button-${faq.id}`

              return (
                <motion.div
                  key={faq.id}
                  variants={fadeUp(0)}
                  initial="initial"
                  whileInView="animate"
                  viewport={inViewOnce}
                >
                  <div className="relative py-6 sm:py-7">
                    {/* Saffron left rule on open — premium detail */}
                    <span
                      aria-hidden
                      className="absolute left-[-12px] top-1/2 -translate-y-1/2 h-0 w-[2px] transition-all duration-500"
                      style={{
                        backgroundColor: GOLD,
                        height: isOpen ? '32px' : '0px',
                      }}
                    />

                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        onClick={() => toggle(faq.id)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="group flex w-full items-start justify-between gap-6 text-left focus-visible:outline-none"
                      >
                        <span
                          className="flex-1 font-display transition-colors duration-300"
                          style={{
                            color: isOpen ? GOLD : TEXT_DARK,
                            fontSize: 'clamp(17px, 1.4vw, 21px)',
                            lineHeight: 1.4,
                            letterSpacing: '-0.005em',
                            fontStyle: isOpen ? 'italic' : 'normal',
                          }}
                        >
                          {faq.question}
                        </span>

                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{
                            duration: 0.3,
                            ease: EASE_OUT_PREMIUM,
                          }}
                          className="mt-1 flex-shrink-0"
                          aria-hidden
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: isOpen ? GOLD : 'transparent',
                              border: `1px solid ${isOpen ? GOLD : GOLD_SOFT}`,
                              color: isOpen ? '#F7F2E8' : GOLD,
                            }}
                          >
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                          </span>
                        </motion.span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: {
                              duration: 0.4,
                              ease: EASE_OUT_PREMIUM,
                            },
                            opacity: { duration: 0.3, delay: 0.05 },
                          }}
                          className="overflow-hidden"
                        >
                          <p
                            className="pt-4 pr-2 font-body leading-relaxed sm:pr-8"
                            style={{
                              color: TEXT_MUTED,
                              fontSize: '15px',
                              lineHeight: 1.7,
                            }}
                          >
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Separator */}
                  <div
                    className="h-px w-full transition-opacity duration-300"
                    style={{
                      background: SAGE_HAIRLINE,
                      opacity: isOpen ? 1 : 0.7,
                    }}
                    aria-hidden
                  />
                </motion.div>
              )
            })}

            {/* View all link */}
            {hasMore && !showAll && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="group inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.22em] transition-colors"
                  style={{ color: GOLD }}
                  onMouseOver={(e) => (e.currentTarget.style.color = TEXT_DARK)}
                  onMouseOut={(e) => (e.currentTarget.style.color = GOLD)}
                >
                  View all {items.length} questions
                  <span
                    aria-hidden
                    className="inline-flex h-1.5 w-1.5 rotate-45 transition-transform duration-300 group-hover:scale-125"
                    style={{ backgroundColor: GOLD }}
                  />
                </button>

                <span
                  className="font-heading text-[10px] font-bold uppercase tracking-[0.32em] tabular-nums"
                  style={{ color: TEXT_QUIET }}
                >
                  {String(displayedItems.length).padStart(2, '0')}
                  <span className="mx-1" style={{ color: GOLD_SOFT }}>/</span>
                  {String(items.length).padStart(2, '0')}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
