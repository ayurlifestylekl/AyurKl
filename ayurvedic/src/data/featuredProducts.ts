import type { FeaturedProduct } from '@/types/content'

/**
 * Five featured products for the asymmetric grid:
 *  - index 0 is the hero (large left tile, spans 2 rows)
 *  - indices 1-4 are secondary tiles
 */
export const featuredProducts: FeaturedProduct[] = [
  {
    id: 'kesha-thailam',
    name: 'Kesha Thailam',
    tagline: 'Cooling Hair & Scalp Oil',
    category: 'Hair Care',
    priceRm: 89,
    badge: 'BESTSELLER',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
    description:
      'Hand-blended in small batches with brahmi, bhringraj and amla. Calms the scalp, deepens sleep, and restores natural shine over six weeks of daily use.',
  },
  {
    id: 'triphala-churna',
    name: 'Triphala Churna',
    tagline: 'Daily Digestive Cleanse',
    category: 'Digestion',
    priceRm: 45,
    image:
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kumkumadi-serum',
    name: 'Kumkumadi Serum',
    tagline: 'Saffron Glow Elixir',
    category: 'Skin Care',
    priceRm: 159,
    oldPriceRm: 199,
    badge: 'SALE',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ashwagandha-tablets',
    name: 'Ashwagandha',
    tagline: 'Stress & Vitality Support',
    category: 'Stress Relief',
    priceRm: 75,
    badge: 'NEW',
    image:
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mahanarayan-oil',
    name: 'Mahanarayan Oil',
    tagline: 'Joint & Muscle Relief',
    category: 'Pain Relief',
    priceRm: 95,
    image:
      'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=800&q=80',
  },
]
