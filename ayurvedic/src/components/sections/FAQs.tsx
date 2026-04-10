'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, HelpCircle } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import { faqs as defaultFaqs, type FAQ } from '@/data/faqs'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

interface FAQsProps {
  items?: FAQ[]
  eyebrow?: string
  title?: string
  subtitle?: string
  id?: string
}

export default function FAQs({
  items = defaultFaqs,
  eyebrow = 'Questions, Answered',
  title = 'Before You Book — A Few Things to Know',
  subtitle = 'The questions guests ask us most often. Still curious? Message us on WhatsApp anytime.',
  id = 'faqs',
}: FAQsProps = {}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  const toggle = (faqId: string) => {
    setOpenId(prev => (prev === faqId ? null : faqId))
  }

  return (
    <SectionWrapper
      id={id}
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      className="bg-cream"
    >
      <motion.div
        variants={staggerParent(0.06, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="mx-auto flex max-w-3xl flex-col gap-4"
      >
        {items.map(faq => {
          const isOpen = openId === faq.id
          const panelId = `faq-panel-${faq.id}`
          const buttonId = `faq-button-${faq.id}`
          return (
            <motion.div
              key={faq.id}
              variants={fadeUp(0)}
              className={`group overflow-hidden rounded-2xl bg-white ring-1 transition-all duration-500 ${
                isOpen
                  ? 'shadow-[0_24px_60px_-30px_rgba(47,93,80,0.55)] ring-accent/40'
                  : 'shadow-[0_14px_40px_-26px_rgba(47,93,80,0.35)] ring-dark/5 hover:ring-accent/25'
              }`}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center gap-5 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:px-8 md:py-6"
                >
                  {/* Decorative leading icon */}
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                      isOpen
                        ? 'bg-primary text-accent'
                        : 'bg-primary/5 text-primary group-hover:bg-primary/10'
                    }`}
                    aria-hidden
                  >
                    <HelpCircle className="h-4 w-4" strokeWidth={2.2} />
                  </span>

                  <span
                    className={`flex-1 font-heading text-[15px] font-bold leading-snug transition-colors duration-300 sm:text-base md:text-[17px] ${
                      isOpen ? 'text-primary' : 'text-dark/85 group-hover:text-primary'
                    }`}
                  >
                    {faq.question}
                  </span>

                  {/* Plus → rotates to X when open */}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 0.92, 0.38, 1.0] }}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                      isOpen
                        ? 'bg-accent text-dark'
                        : 'bg-dark/5 text-primary group-hover:bg-accent/20'
                    }`}
                    aria-hidden
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.6} />
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
                      height: { duration: 0.42, ease: [0.22, 0.92, 0.38, 1.0] },
                      opacity: { duration: 0.3, delay: 0.05 },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 md:px-8 md:pb-8">
                      {/* Gold accent bar */}
                      <span
                        aria-hidden
                        className="mb-4 ml-[60px] block h-[2px] w-12 rounded-full bg-accent"
                      />
                      <p className="ml-[60px] max-w-xl font-body text-[15px] leading-relaxed text-dark/70">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </SectionWrapper>
  )
}
