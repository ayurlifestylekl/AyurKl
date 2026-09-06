'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'
import type { Product } from '@/types/content'

/**
 * Detail page main image. A quiet, on-brand blush→gold plate the product
 * sits inside — no color blending on the photo itself, just a warm ground
 * around it, so real product colors stay true.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const outOfStock = product.stockQty === 0
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.0, ease: EASE_OUT_PREMIUM }}
      className="relative lg:sticky lg:top-[108px] lg:self-start"
    >
      <div
        className="relative aspect-square overflow-hidden rounded-[2px]"
        style={{
          background: 'radial-gradient(circle at 50% 42%, #F3E2CE 0%, #ECD9BC 100%)',
        }}
      >
        <Image
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          fill
          sizes="(max-width: 1024px) 100vw, 38vw"
          priority
          className="p-[18%]"
          style={{
            objectFit: 'contain',
            filter: outOfStock ? 'saturate(0.4) brightness(0.9)' : undefined,
          }}
        />
        <span className="absolute left-4 top-4 rounded-sm bg-cream/85 px-2.5 py-1.5 font-heading text-[9px] font-bold uppercase tracking-[0.24em] text-primary backdrop-blur">
          SKU · {product.sku}
        </span>
        {outOfStock && (
          <span className="absolute bottom-4 left-4 rounded-sm bg-dark/80 px-2.5 py-1.5 font-heading text-[9px] font-bold uppercase tracking-[0.24em] text-cream">
            Out of Stock
          </span>
        )}
      </div>
    </motion.div>
  )
}
