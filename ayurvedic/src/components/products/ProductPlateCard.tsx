'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import type { Product, ProductBadge } from '@/types/content'
import NocturneFrame from './atmosphere/NocturneFrame'

const badgeAccent: Record<ProductBadge, string> = {
  NEW:        'text-secondary',
  BESTSELLER: 'text-accent',
  SALE:       'text-primary',
  COMBO:      'text-secondary',
}

const badgeLabel: Record<ProductBadge, string> = {
  NEW: 'NEW',
  BESTSELLER: 'BESTSELLER',
  SALE: 'SALE',
  COMBO: 'COMBO',
}

export default function ProductPlateCard({ product }: { product: Product }) {
  const outOfStock = product.stockQty === 0

  return (
    <motion.article variants={fadeUp(0)} className="group flex flex-col">
      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name} — ${product.tagline}`}
        className="flex flex-col rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <NocturneFrame
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          dimmed={outOfStock}
          imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          className="rounded-[2px]"
        >
          {/* bottom overlay — name + price */}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <h3
              className="font-display text-[17px] italic leading-tight"
              style={{
                color: '#F3E6CB',
                textShadow: '0 2px 14px rgba(0,0,0,0.6)',
              }}
            >
              {product.name}
            </h3>
            {outOfStock ? (
              <span
                className="font-display text-[12px] italic"
                style={{ color: 'rgba(243,230,203,0.8)' }}
              >
                Out of stock
              </span>
            ) : (
              <span
                className="font-heading text-[13px] font-semibold tracking-[0.03em] text-accent"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
              >
                RM{product.priceRm}
              </span>
            )}
          </div>
        </NocturneFrame>

        {/* below the frame — category + badge */}
        <div className="mt-3 flex items-center gap-2 font-heading text-[10px] font-semibold uppercase tracking-[0.22em]">
          <span className="text-dark/55">
            {product.category.replace('-', ' ')}
          </span>
          {product.badge && (
            <>
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
              <span className={badgeAccent[product.badge]}>
                {badgeLabel[product.badge]}
              </span>
            </>
          )}
        </div>

        {/* gold underline that grows on hover */}
        <span
          aria-hidden
          className="mt-2 block h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-10"
        />
      </Link>
    </motion.article>
  )
}
