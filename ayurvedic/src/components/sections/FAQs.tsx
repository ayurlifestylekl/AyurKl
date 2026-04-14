'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageCircle } from 'lucide-react'
import { fadeUp, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'
import { faqs as defaultFaqs, type FAQ } from '@/data/faqs'

interface FAQsProps {
  items?: FAQ[]
  eyebrow?: string
  title?: string
  subtitle?: string
  id?: string
}

/**
 * Two-column editorial FAQ layout.
 * Left: sticky title + WhatsApp link. Right: minimal accordion.
 */
export default function FAQs({
  items = defaultFaqs,
  eyebrow = 'Common Questions',
  title = 'Before You Book',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subtitle: _subtitle,
  id = 'faqs',
}: FAQsProps = {}) {
  const displayedItems = items.slice(0, 5)
  const [openId, setOpenId] = useState<string | null>(displayedItems[0]?.id ?? null)
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
      className="relative bg-cream"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 md:py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
          {/* ── LEFT: Sticky sidebar ──────────────────── */}
          <motion.div
            variants={fadeUp(0)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
              {eyebrow}
            </span>
            <h2
              id="faq-heading"
              className="mt-3 font-heading text-3xl font-extrabold leading-[1.1] text-primary sm:text-4xl"
            >
              {title}
            </h2>
            <p className="mt-4 max-w-sm font-body text-[14px] leading-[1.7] text-dark/55">
              The questions guests ask us most often. Still curious?
            </p>
            <a
              href="https://wa.me/601165043436"
              className="group mt-5 inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-primary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </a>
          </motion.div>

          {/* ── RIGHT: Accordion ──────────────────────── */}
          <div className="flex flex-col">
            {visibleItems.map((faq, i) => {
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
                  {/* Gold separator line */}
                  {i > 0 && (
                    <div
                      className="h-px"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(212,163,115,0.2), rgba(212,163,115,0.1), transparent)',
                      }}
                      aria-hidden
                    />
                  )}

                  <div className="py-5">
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        onClick={() => toggle(faq.id)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        <span
                          className={`flex-1 font-heading text-[15px] font-semibold leading-snug transition-colors duration-300 ${
                            isOpen
                              ? 'text-primary'
                              : 'text-dark/80 hover:text-primary'
                          }`}
                        >
                          {faq.question}
                        </span>

                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{
                            duration: 0.3,
                            ease: EASE_OUT_PREMIUM,
                          }}
                          className="flex-shrink-0 text-accent"
                          aria-hidden
                        >
                          <Plus className="h-5 w-5" strokeWidth={2} />
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
                          <p className="pt-3 pl-0 font-body text-[14px] leading-[1.75] text-dark/60 md:pl-0">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}

            {/* Bottom separator */}
            <div
              className="h-px"
              style={{
                background:
                  'linear-gradient(to right, rgba(212,163,115,0.2), rgba(212,163,115,0.1), transparent)',
              }}
              aria-hidden
            />

            {/* View all link */}
            {hasMore && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-5 self-start font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                View all questions
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
