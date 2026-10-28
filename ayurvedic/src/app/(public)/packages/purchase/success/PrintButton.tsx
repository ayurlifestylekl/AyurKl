'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-primary/90"
    >
      <Printer className="h-4 w-4" /> Print receipt
    </button>
  )
}
