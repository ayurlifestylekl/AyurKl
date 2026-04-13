import type { LucideIcon } from 'lucide-react'

export interface TrustItem {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
}

export interface Category {
  slug: string
  label: string
  icon: LucideIcon
  image: string
  href: string
}

export interface Therapy {
  slug: string
  name: string
  tagline: string
  durationMin: number
  priceRm: number
  image: string
  bullets: [string, string, string]
}

export type PromoAccent = 'primary' | 'accent' | 'secondary'

export interface PromoBanner {
  id: string
  headline: string
  sub: string
  icon: LucideIcon
  accent: PromoAccent
}

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'SALE' | 'COMBO'

export interface FeaturedProduct {
  id: string
  name: string
  tagline: string
  category: string
  priceRm: number
  oldPriceRm?: number
  badge?: ProductBadge
  image: string
  description?: string
}

export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  priceRm: number
  oldPriceRm?: number
  badge?: ProductBadge
  image: string
  sku: string
  stockQty: number
  isBundle: boolean
  createdAt: string
}
