'use client'

import { motion } from 'framer-motion'
import {
  Leaf,
  Flame,
  Mountain,
  Droplet,
  Sun,
  Moon,
  Wind,
  Sparkle,
  Feather,
  Gem,
  Sprout,
  Cloud,
  type LucideIcon,
} from 'lucide-react'
import type { QuizQuestion, Dosha } from '@/types/quiz'

const ICONS: Record<string, LucideIcon> = {
  leaf: Leaf,
  flame: Flame,
  mountain: Mountain,
  droplet: Droplet,
  sun: Sun,
  moon: Moon,
  wind: Wind,
  sparkle: Sparkle,
  feather: Feather,
  gem: Gem,
  sprout: Sprout,
  cloud: Cloud,
}

interface QuestionCardProps {
  question: QuizQuestion
  selected: Dosha | null
  onSelect: (optionDosha: Dosha) => void
  currentNumber: number
  totalNumber: number
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
  currentNumber,
  totalNumber,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col gap-6"
    >
      <header>
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1e3d32]/45">
          Question {currentNumber} of {totalNumber}
        </p>
        <h2
          className="mt-2 font-heading text-[24px] font-bold leading-tight text-[#1e3d32] sm:text-[30px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          {question.prompt}
        </h2>
        {question.helper && (
          <p
            className="mt-2 font-body text-[13px] italic text-[#2B2B2B]/55"
            style={{ lineHeight: 1.55 }}
          >
            {question.helper}
          </p>
        )}
      </header>

      <ul className="flex flex-col gap-3">
        {question.options.map((option) => {
          const Icon = option.icon ? ICONS[option.icon] : null
          const isSelected = selected === option.dosha
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelect(option.dosha)}
                aria-pressed={isSelected}
                className={`group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border bg-white px-5 py-4 text-left transition-all sm:px-6 ${
                  isSelected
                    ? 'border-[#D4A373] bg-[#FAF6EE]/55 shadow-[0_1px_0_0_rgba(212,163,115,0.18),0_18px_36px_-22px_rgba(212,163,115,0.5)]'
                    : 'border-[#1e3d32]/10 hover:-translate-y-0.5 hover:border-[#D4A373]/40 hover:bg-[#FAF6EE]/30'
                }`}
                style={{
                  boxShadow: isSelected
                    ? undefined
                    : '0 1px 0 0 rgba(30,61,50,0.04), 0 8px 22px -16px rgba(30,61,50,0.18)',
                }}
              >
                {/* Gold left rule when selected */}
                {isSelected && (
                  <motion.span
                    layoutId="option-pill"
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px] bg-[#D4A373]"
                  />
                )}

                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected ? 'bg-[#D4A373]/15' : 'bg-[#1e3d32]/[0.06] group-hover:bg-[#D4A373]/10'
                  }`}
                >
                  {Icon ? (
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isSelected ? 'text-[#D4A373]' : 'text-[#2F5D50]'
                      }`}
                      strokeWidth={1.6}
                    />
                  ) : null}
                </span>

                <div className="flex-1">
                  <p
                    className={`font-heading text-[14.5px] font-semibold transition-colors ${
                      isSelected ? 'text-[#1e3d32]' : 'text-[#1e3d32]/90'
                    }`}
                    style={{ letterSpacing: '-0.005em' }}
                  >
                    {option.label}
                  </p>
                  {option.hint && (
                    <p
                      className="mt-1 font-body text-[12.5px] text-[#2B2B2B]/55"
                      style={{ lineHeight: 1.55 }}
                    >
                      {option.hint}
                    </p>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}
