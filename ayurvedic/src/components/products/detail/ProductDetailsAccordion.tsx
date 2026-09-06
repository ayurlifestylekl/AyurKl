'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionRow {
  label: string
  content: string
}

/**
 * Single-open accordion for Ingredients / How to Use / Good to Know.
 * Rows with no data are simply never passed in — no empty state to handle.
 */
export default function ProductDetailsAccordion({ rows }: { rows: AccordionRow[] }) {
  const [openIndex, setOpenIndex] = useState(0)
  if (rows.length === 0) return null

  return (
    <div className="border-t border-accent/25">
      {rows.map((row, i) => {
        const open = openIndex === i
        return (
          <div key={row.label} className="border-b border-accent/20">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-4 text-left font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
            >
              {row.label}
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                strokeWidth={2.5}
              />
            </button>
            <div
              className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="pb-4 font-body text-[13.5px] leading-[1.8] text-dark/72">
                  {row.content}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
