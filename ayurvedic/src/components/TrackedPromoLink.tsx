'use client'

import { useEffect, type ComponentPropsWithoutRef, type MouseEvent } from 'react'
import Link from 'next/link'
import { trackPromoEvent } from '@/lib/packages/track-promo'
import type { PromoEventInput } from '@/lib/packages/promo-events'

type Props = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: string
  track: PromoEventInput
}

/** A normal link that also counts the click in the promo stats. */
export default function TrackedPromoLink({ href, track, onClick, ...rest }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    trackPromoEvent(track)
    onClick?.(e)
  }

  return href.startsWith('/') ? (
    <Link href={href} onClick={handleClick} {...rest} />
  ) : (
    <a href={href} onClick={handleClick} {...rest} />
  )
}

/** Counts one visit to the page it's rendered on. */
export function PromoPageView({ track }: { track: PromoEventInput }) {
  useEffect(() => {
    trackPromoEvent(track)
    // Once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
