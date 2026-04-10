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
 * Horizontal scrolling tab bar with editorial styling.
 *
 * - Shows a numbered prefix per tab ("01 · Face Care") to mirror the PDF.
 * - Sticky below the navbar so the active filter stays in reach as users scroll.
 * - Keyboard navigable with ← / → arrow keys (standard tab pattern).
 * - Active tab uses Deep Herbal Green; inactive tabs are airy primary tints.
 */
export default function CategoryTabs({ tabs, activeId, onChange }: CategoryTabsProps) {
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Smoothly scroll the active tab into view when it changes —
  // matters most on mobile where the tab bar overflows horizontally.
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
      className="sticky top-0 z-30 -mx-6 border-b border-primary/10 bg-[#FAF6EE]/85 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
    >
      {/* Subtle gold underline so the bar reads as intentional */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <div
        role="tablist"
        aria-label="Treatment categories"
        className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto scroll-smooth py-1"
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
                'group relative inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.18em] transition-[transform,background-color,color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]',
                isActive
                  ? 'bg-primary text-white shadow-[0_12px_30px_-14px_rgba(47,93,80,0.85)]'
                  : 'bg-white text-primary/75 ring-1 ring-primary/15 hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary',
              ].join(' ')}
            >
              <span
                className={[
                  'font-heading text-[9.5px] font-extrabold tabular-nums',
                  isActive ? 'text-accent' : 'text-primary/40',
                ].join(' ')}
              >
                {String(idx).padStart(2, '0')}
              </span>
              <span aria-hidden className={isActive ? 'text-white/40' : 'text-primary/25'}>
                ·
              </span>
              <span>{tab.label}</span>
              <span
                aria-hidden
                className={[
                  'ml-1 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] tabular-nums',
                  isActive ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary/60',
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

/**
 * Convenience builder used by the parent menu to assemble the tabs array,
 * including the synthetic "All" tab at the front.
 */
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
