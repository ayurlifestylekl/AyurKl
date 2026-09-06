import {
  Sparkles,
  Bone,
  Moon,
  Droplets,
} from 'lucide-react'
import type { Category } from '@/types/content'

/**
 * Shop categories — kept in sync with the categories the live product
 * catalogue actually uses (Product Management → Catalog). Add one here
 * only once a product in that group has shipped.
 */
export const categories: Category[] = [
  {
    slug: 'hair-care',
    label: 'Hair Care',
    icon: Sparkles,
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    href: '/products?category=hair-care',
  },
  {
    slug: 'pain-relief',
    label: 'Pain Relief',
    icon: Bone,
    image:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80',
    href: '/products?category=pain-relief',
  },
  {
    slug: 'skin-care',
    label: 'Skincare',
    icon: Droplets,
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    href: '/products?category=skin-care',
  },
  {
    slug: 'stress-relief',
    label: 'Stress Relief',
    icon: Moon,
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
    href: '/products?category=stress-relief',
  },
]
