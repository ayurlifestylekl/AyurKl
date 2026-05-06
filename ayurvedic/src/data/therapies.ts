import type { Therapy } from '@/types/content'

export const therapies: Therapy[] = [
  {
    slug: 'abhyanga',
    name: 'Abhyanga',
    tagline: 'Warm Oil Massage',
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
    tagline: 'Forehead Oil Stream',
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
    slug: 'pizhichil',
    name: 'Pizhichil',
    tagline: 'Royal Oil Bath',
    durationMin: 75,
    priceRm: 320,
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    bullets: [
      'Continuous warm-oil pour',
      'Signature Kerala therapy',
      'Deep muscular and joint relief',
    ],
  },
  {
    slug: 'panchakarma',
    name: 'Panchakarma',
    tagline: 'Five-Stage Detox',
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
  {
    slug: 'nasya',
    name: 'Nasya',
    tagline: 'Nasal Therapy',
    durationMin: 30,
    priceRm: 120,
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
    bullets: [
      'Clears sinus congestion',
      'Eases chronic headaches',
      'Sharpens mental clarity',
    ],
  },
]
