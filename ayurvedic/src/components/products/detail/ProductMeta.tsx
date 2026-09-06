'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import type { Product } from '@/types/content'
import AddToBagButton from './AddToBagButton'
import ProductDetailsAccordion from './ProductDetailsAccordion'

interface ProductMetaProps {
  product: Product
  categoryLabel: string
}

export default function ProductMeta({ product, categoryLabel }: ProductMetaProps) {
  const outOfStock = product.stockQty === 0
  const hasDiscount = !!product.oldPriceRm && product.oldPriceRm > product.priceRm

  return (
    <motion.div
      variants={staggerParent(0.08, 0.04)}
      initial="initial"
      whileInView="animate"
      viewport={inViewOnce}
      className="flex flex-col gap-6 lg:sticky lg:top-[108px] lg:self-start"
    >
      {/* Breadcrumb */}
      <motion.nav
        variants={fadeUp(0)}
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent/75"
      >
        <Link href="/products" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          The Apothecary
        </Link>
        <span aria-hidden>→</span>
        <span className="text-primary/70">{categoryLabel}</span>
        <span aria-hidden>→</span>
        <span className="text-dark/55">{product.name}</span>
      </motion.nav>

      <motion.span
        variants={fadeUp(0)}
        aria-hidden
        className="h-px w-24 bg-accent/70"
      />

      {/* Name + tagline */}
      <motion.h1
        variants={fadeUp(0)}
        className="font-display italic text-primary"
        style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}
      >
        {product.name}
      </motion.h1>
      <motion.p variants={fadeUp(0)} className="font-display italic text-accent">
        {product.tagline}
      </motion.p>

      {/* Price */}
      <motion.div variants={fadeUp(0)} className="flex items-baseline gap-3">
        <span className="font-heading text-[28px] font-extrabold text-accent">
          RM{product.priceRm}
        </span>
        {hasDiscount && (
          <span className="font-body text-[15px] text-dark/35 line-through">
            RM{product.oldPriceRm}
          </span>
        )}
      </motion.div>

      {/* Good for */}
      {product.useCases && product.useCases.length > 0 && (
        <motion.div variants={fadeUp(0)} className="flex flex-wrap gap-1.5">
          {product.useCases.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-3 py-1 font-heading text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/80"
            >
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </motion.div>
      )}

      {/* Description */}
      <motion.div variants={fadeUp(0)} className="product-description">
        <style>{`
          .product-description p::first-letter {
            font-family: var(--font-playfair), Georgia, serif;
            font-style: italic;
            color: #D4AF37;
            float: left;
            font-size: 2.6em;
            line-height: 0.85;
            padding-right: 0.1em;
            padding-top: 0.05em;
            margin-bottom: -0.12em;
          }
        `}</style>
        <p className="font-body text-[16px] leading-[1.8] text-dark/85">
          {product.description}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div variants={fadeUp(0)} className="mt-2">
        <AddToBagButton productId={product.id} disabled={outOfStock} />
      </motion.div>

      {/* Trust row */}
      <motion.div
        variants={fadeUp(0)}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-dark/50"
      >
        <span>Hand-blended · Kerala</span>
        <span aria-hidden className="h-1 w-1 rounded-full bg-accent/60" />
        <span>Ships within 48h</span>
        <span aria-hidden className="h-1 w-1 rounded-full bg-accent/60" />
        <span>Free over RM 150</span>
      </motion.div>

      {/* Ingredients / How to Use / Good to Know */}
      <motion.div variants={fadeUp(0)}>
        <ProductDetailsAccordion
          rows={[
            ...(product.ingredients && product.ingredients.length > 0
              ? [{ label: 'Ingredients', content: product.ingredients.join(', ') }]
              : []),
            ...(product.dose ? [{ label: 'How to Use', content: product.dose }] : []),
            ...(product.contraindications
              ? [{ label: 'Good to Know', content: product.contraindications }]
              : []),
          ]}
        />
      </motion.div>

      {/* Vaidya note */}
      <motion.aside
        variants={fadeUp(0)}
        className="mt-2 border-l-2 border-accent/50 pl-4"
      >
        <p className="font-body italic text-[14px] leading-[1.7] text-primary/75">
          &ldquo;This is prescribed from classical Kerala texts. Best used consistently
          for six weeks before judging its effect.&rdquo;
        </p>
        <p className="mt-3 font-display italic text-[18px] text-accent">— our Vaidyas</p>
        <p className="font-heading text-[9px] font-bold uppercase tracking-[0.25em] text-primary/50">
          B.A.M.S
        </p>
      </motion.aside>
    </motion.div>
  )
}
