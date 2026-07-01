import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F7F2E8] px-6 text-center">
      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
        Kerala Ayurvedic Lifestyle
      </span>
      <p className="mt-4 font-display text-[52px] italic leading-none text-[#6E1023]">404</p>
      <h1 className="mt-2 font-heading text-[20px] font-extrabold text-[#6E1023]">This page wandered off.</h1>
      <p className="mt-3 max-w-md font-body text-[14px] leading-relaxed text-[#1F1F1F]/65">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[#6E1023] px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#4A0C18]"
        >
          Back to home
        </Link>
        <Link
          href="/treatments"
          className="rounded-full border border-[#6E1023]/25 px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#6E1023] transition-colors hover:border-[#D4AF37]"
        >
          Browse therapies
        </Link>
      </div>
    </div>
  )
}
