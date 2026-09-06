'use client'

import React, { useState } from 'react'
import { ShoppingBag, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart/CartProvider'

interface AddToBagButtonProps {
  productId: string
  disabled?: boolean
}

/**
 * Outline gold pill that expands to a qty stepper + commit button.
 * Adds the product to the localStorage cart via CartProvider.
 */
export default function AddToBagButton({ productId, disabled }: AddToBagButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const [qty, setQty] = useState(1)
  const { addItems } = useCart()

  function handleAdd() {
    if (disabled) return
    addItems([{ productId, quantity: qty }])
    toast.success(`${qty} ${qty === 1 ? 'item' : 'items'} added to your bag`, {
      description: 'View bag or keep browsing.',
      action: {
        label: 'View bag',
        onClick: () => {
          window.location.href = '/cart'
        },
      },
    })
    setExpanded(false)
    setQty(1)
  }

  if (!expanded) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setExpanded(true)}
        className="group relative flex w-full min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-[2px] bg-[linear-gradient(135deg,#F6DD8E_0%,#E7C457_30%,#D4AF37_52%,#B8860B_100%)] font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-[#3A1208] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_16px_34px_-16px_rgba(212,175,55,0.85)] transition-transform duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {!disabled && (
          <span
            aria-hidden
            className="shimmer-sweep pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
              width: '60%',
            }}
          />
        )}
        <ShoppingBag className="relative z-10 h-4 w-4" strokeWidth={2} />
        <span className="relative z-10">{disabled ? 'Out of Stock' : 'Add to Bag'}</span>
      </button>
    )
  }

  return (
    <div className="flex w-full items-stretch gap-2 rounded-[2px] border border-accent/50 bg-white/70 p-1 backdrop-blur">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] text-primary transition-colors duration-200 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span aria-live="polite" className="flex min-w-[2ch] items-center justify-center font-heading text-[14px] font-bold text-primary">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQty((q) => q + 1)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] text-primary transition-colors duration-200 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={handleAdd}
        className="ml-1 flex-1 rounded-[2px] bg-[linear-gradient(135deg,#F6DD8E_0%,#E7C457_30%,#D4AF37_52%,#B8860B_100%)] font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-[#3A1208] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-transform duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Add
      </button>
    </div>
  )
}
