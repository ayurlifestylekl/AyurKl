import { Award, BadgeCheck, Leaf } from 'lucide-react'
import type { TrustItem } from '@/types/content'

export const trustItems: TrustItem[] = [
  {
    id: 'heritage',
    title: 'Since 2008 · Heritage',
    subtitle: 'Over 15 years serving Brickfields and the Klang Valley with authentic Kerala Ayurveda treatments.',
    icon: Award,
  },
  {
    id: 'certified',
    title: 'Certified Vaidya',
    subtitle: 'Every treatment supervised by Vaidya AKHIL HS (B.A.M.S), trained in Kerala with 16+ years clinical experience.',
    icon: BadgeCheck,
  },
  {
    id: 'authentic',
    title: '100% Authentic Formulas',
    subtitle: 'Pure herbs and therapeutic oils sourced directly from Kerala for genuine Ayurvedic healing.',
    icon: Leaf,
  },
]
