import type { Therapy } from '@/types/content'

export const therapies: Therapy[] = [
  {
    slug: 'abhyanga',
    name: 'Abhyanga',
    tagline: 'Full-Body Warm Oil Massage',
    durationMin: 60,
    priceRm: 180,
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80',
    bullets: [
      'Synchronised four-hand technique',
      'Personalised herbal oil blend',
      'Releases deep muscle tension',
    ],
  },
  {
    slug: 'shirodhara',
    name: 'Shirodhara',
    tagline: 'Forehead Oil Therapy for Mental Calm',
    durationMin: 45,
    priceRm: 220,
    image:
      'https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&w=900&q=80',
    bullets: [
      'Quietens the nervous system',
      'Improves sleep quality',
      'Eases anxiety and headaches',
    ],
  },
  {
    slug: 'panchakarma',
    name: 'Panchakarma',
    tagline: 'Five-Stage Detox Programme',
    durationMin: 90,
    priceRm: 480,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
    bullets: [
      'Complete cellular detoxification',
      'Custom dosha assessment',
      'Multi-day retreat option',
    ],
  },
]
