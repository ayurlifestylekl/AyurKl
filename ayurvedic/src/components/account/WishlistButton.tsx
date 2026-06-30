'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { toggleWishlist } from '@/actions/wishlist/toggleWishlist'

interface WishlistButtonProps {
  productId: string
  initialSaved: boolean
  variant?: 'icon' | 'pill'
}

export default function WishlistButton({ productId, initialSaved, variant = 'icon' }: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const res = await toggleWishlist(productId)
      if (res.ok) {
        setSaved(res.saved)
        toast.success(res.saved ? 'Saved to wishlist.' : 'Removed from wishlist.')
      } else {
        toast.error(res.error)
      }
    })
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] transition-all disabled:opacity-50 ${
          saved
            ? 'border-[#D4AF37] bg-[#D4AF37]/[0.12] text-[#6E1023]'
            : 'border-[#6E1023]/15 bg-white text-[#6E1023] hover:bg-[#6E1023]/[0.04]'
        }`}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
        {saved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all disabled:opacity-50 ${
        saved
          ? 'border-[#D4AF37] bg-white text-[#D4AF37]'
          : 'border-[#6E1023]/12 bg-white text-[#6E1023]/55 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]'
      }`}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-[#D4AF37]' : ''}`} strokeWidth={1.8} />
    </button>
  )
}
