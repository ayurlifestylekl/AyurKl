'use client'

import React, { useEffect, useRef } from 'react'

import type { TreatmentCategory } from '@/types/treatments'

export interface TabItem {
  id: string
  label: string
  count: number
}

interface CategoryTabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
}

/**
 * Elegant filter bar — visible borders, gold count badges,
 * layered active state. Keyboard navigable.
 */
export default function CategoryTabs({ tabs, activeId, onChange }: CategoryTabsProps) {
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const btn = buttonsRef.current.get(activeId)
    if (!btn) return
    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeId])

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, currentIdx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const nextIdx = (currentIdx + dir + tabs.length) % tabs.length
    const nextTab = tabs[nextIdx]
    onChange(nextTab.id)
    buttonsRef.current.get(nextTab.id)?.focus()
  }

  return (
    <div
      ref={containerRef}
      className="sticky top-0 z-30 -mx-6 bg-cream/92 px-6 py-4 backdrop-blur-lg sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
    >
      {/* Visible gold bottom border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-accent/25 sm:inset-x-8 lg:inset-x-12"
      />

      <div
        role="tablist"
        aria-label="Treatment categories"
        className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto scroll-smooth py-0.5"
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) buttonsRef.current.set(tab.id, el)
              }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls="treatments-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKey(e, idx)}
              className={[
                'group relative inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.15em] transition-[transform,background-color,color,box-shadow,ring-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]',
                isActive
                  ? 'bg-primary text-white shadow-[0_6px_20px_-6px_rgba(47,93,80,0.55),0_2px_6px_rgba(47,93,80,0.12)]'
                  : 'bg-white text-primary/55 ring-1 ring-primary/12 hover:-translate-y-0.5 hover:text-primary hover:ring-accent/40 hover:shadow-[0_8px_24px_-12px_rgba(47,93,80,0.15)]',
              ].join(' ')}
            >
              <span>{tab.label}</span>
              <span
                aria-hidden
                className={[
                  'inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tabular-nums',
                  isActive
                    ? 'bg-accent/25 text-accent'
                    : 'bg-primary/6 text-primary/40',
                ].join(' ')}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function buildTabs(
  categories: TreatmentCategory[],
  countByCategoryId: Record<string, number>,
  totalCount: number,
): TabItem[] {
  return [
    { id: 'all', label: 'All Therapies', count: totalCount },
    ...categories.map((c) => ({
      id: c._id,
      label: c.title,
      count: countByCategoryId[c._id] ?? 0,
    })),
  ]
}
