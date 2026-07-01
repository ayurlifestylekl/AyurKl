'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface to the server logs / monitoring.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F7F2E8] px-6 text-center">
      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
        Kerala Ayurvedic Lifestyle
      </span>
      <h1 className="mt-4 font-heading text-[26px] font-extrabold text-[#6E1023] sm:text-[32px]">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-md font-body text-[14px] leading-relaxed text-[#1F1F1F]/65">
        A hiccup on our side — please try again. If it keeps happening, reach us on WhatsApp and we&apos;ll help you straight away.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[#6E1023] px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#4A0C18]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#6E1023]/25 px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#6E1023] transition-colors hover:border-[#D4AF37]"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
