import {
  Award,
  UserCheck,
  HeartHandshake,
  Compass,
  Sprout,
  UserCog,
  Flower2,
  Bone,
  Brain,
  Sparkles,
  Droplets,
  Baby,
  Users,
  HeartPulse,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import type { FAQ } from '@/data/faqs'

export interface AboutPillar {
  id: string
  title: string
  body: string
  icon: LucideIcon
}

export interface WellnessFocusArea {
  id: string
  label: string
  icon: LucideIcon
  highlighted?: boolean
}

/* Section 3 — Our Philosophy */
export const philosophyPillars: AboutPillar[] = [
  {
    id: 'authenticity',
    title: 'Authenticity',
    body: 'Every therapy reflects the true essence of Kerala\u2019s 5,000-year-old healing science.',
    icon: Award,
  },
  {
    id: 'personalization',
    title: 'Personalization',
    body: 'We design each protocol around your unique constitution, history, and goals.',
    icon: UserCheck,
  },
  {
    id: 'holistic',
    title: 'Holistic Healing',
    body: 'We treat the root cause \u2014 restoring balance, not just easing symptoms.',
    icon: HeartHandshake,
  },
]

/* Section 5 — The KALS Difference */
export const kalsDifferences: AboutPillar[] = [
  {
    id: 'lineage',
    title: 'Expert Lineage',
    body: 'Real Kerala therapists using time-tested techniques passed down through generations.',
    icon: Compass,
  },
  {
    id: 'purity',
    title: 'Natural Purity',
    body: 'Only high-quality herbal oils and formulations \u2014 no fillers, no shortcuts.',
    icon: Sprout,
  },
  {
    id: 'customised',
    title: 'Customised Care',
    body: 'Every therapy tailored to your dosha, history, and personal goals.',
    icon: UserCog,
  },
  {
    id: 'environment',
    title: 'Healing Environment',
    body: 'A calm, welcoming space designed to slow your nervous system the moment you arrive.',
    icon: Flower2,
  },
]

/* Section 6 — Wellness Focus pills */
export const wellnessFocusAreas: WellnessFocusArea[] = [
  { id: 'joint-spine', label: 'Joint & Spine Care', icon: Bone },
  { id: 'stress-relief', label: 'Stress Relief & Relaxation', icon: Brain },
  { id: 'skin-beauty', label: 'Skin & Beauty Therapies', icon: Sparkles },
  { id: 'detox', label: 'Detox & Rejuvenation', icon: Droplets },
  { id: 'post-delivery', label: 'Post-Delivery Care', icon: Baby },
  { id: 'elderly', label: 'Elderly Wellness & Long-Term Care', icon: Users },
  { id: 'kids', label: 'Kids Wellness', icon: HeartPulse },
  {
    id: 'occupational',
    label: 'Occupational Wellness for Working Professionals',
    icon: Briefcase,
    highlighted: true,
  },
]

/* Section 7 — About-specific FAQs */
export const aboutFaqs: FAQ[] = [
  {
    id: 'who-is-vaidya',
    question: 'Who is Vaidya AKHIL HS?',
    answer:
      'Vaidya AKHIL HS holds a B.A.M.S (Bachelor of Ayurvedic Medicine and Surgery) degree and brings over 16 years of clinical experience from Kerala. He is registered with the National Council of Indian System of Medicine (NCISM) and recognised in Malaysia under KKM. Every consultation at KALS begins with him personally.',
  },
  {
    id: 'what-is-kkm',
    question: 'What is KKM and why does it matter?',
    answer:
      'KKM stands for Kementerian Kesihatan Malaysia \u2014 the Ministry of Health. KKM recognition means that our practitioners and therapists meet Malaysia\u2019s medical regulatory standards for traditional and complementary medicine. It is the official assurance that you are in qualified, accountable hands.',
  },
  {
    id: 'kerala-therapists',
    question: 'Are your therapists really from Kerala?',
    answer:
      'Yes \u2014 our founder Datto Shan personally brings therapists directly from Kerala. Each holds a formal Ayurvedic therapy qualification, has more than 8 years of experience, and is registered with KKM in Malaysia.',
  },
  {
    id: 'kids-elderly',
    question: 'Do you treat children and the elderly?',
    answer:
      'Absolutely. We offer dedicated kids wellness therapies and long-term elder care protocols alongside our adult treatments. Each one is gentler, slower-paced, and adjusted to the specific needs of that life stage.',
  },
  {
    id: 'working-professional',
    question: 'I\u2019m a working professional with chronic stress \u2014 can you help?',
    answer:
      'Yes \u2014 this is one of our core specialities. Our occupational wellness programmes are designed specifically for working professionals dealing with day-to-day stress, fatigue, poor sleep, and lifestyle-related concerns. We build a protocol that fits around your work schedule, not the other way around.',
  },
]
