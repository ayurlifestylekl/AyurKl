'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { fadeUp } from '@/lib/motion'
import type { Product, ProductBadge } from '@/types/content'

const badgeColors: Record<ProductBadge, string> = {
  NEW: 'text-secondary',
  BESTSELLER: 'text-accent',
  SALE: 'text-primary',
  COMBO: 'text-[#7A9D54]',
}

const badgeLabel: Record<ProductBadge, string> = {
  NEW: 'NEW',
  BESTSELLER: 'BESTSELLER',
  SALE: 'SALE',
  COMBO: 'COMBO DEAL',
}

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stockQty === 0

  return (
    <motion.article variants={fadeUp(0)} className="group flex flex-col">
      <Link
        href={`/products/${product.id}`}
        aria-label={product.name}
        className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
          <Image
            src={product.image}
            alt={`${product.name} — ${product.tagline}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Green tint overlay */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.05)' }}
            aria-hidden
          />

          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute left-3 top-3 font-heading text-[9px] font-bold uppercase tracking-[0.18em] ${badgeColors[product.badge]}`}
            >
              {badgeLabel[product.badge]}
            </span>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/40">
              <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Text */}
        <span className="mt-3 font-heading text-[9px] font-semibold uppercase tracking-[0.22em] text-dark/35">
          {product.category.replace('-', ' ')}
        </span>
        <h3 className="mt-1 font-heading text-[15px] font-bold text-dark/80 transition-colors duration-300 group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-0.5 font-body text-[12px] italic text-dark/45">
          {product.tagline}
        </p>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          {product.oldPriceRm && (
            <span className="font-body text-[12px] text-dark/35 line-through">
              RM{product.oldPriceRm}
            </span>
          )}
          <data
            value={product.priceRm}
            className="font-heading text-lg font-extrabold text-primary"
          >
            RM{product.priceRm}
          </data>
        </div>

        {/* Gold underline on hover */}
        <span
          className="mt-2 block h-px w-0 bg-accent transition-[width] duration-500 group-hover:w-10"
          aria-hidden
        />
      </Link>

      {/* Add to Bag */}
      <button
        type="button"
        disabled={outOfStock}
        aria-label={`Add ${product.name} to bag`}
        className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-transparent px-5 py-2 font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-primary opacity-0 transition-[opacity,colors] duration-300 hover:border-accent hover:bg-accent hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-30 sm:opacity-0 max-sm:opacity-100"
      >
        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
        Add to Bag
      </button>
    </motion.article>
  )
}
