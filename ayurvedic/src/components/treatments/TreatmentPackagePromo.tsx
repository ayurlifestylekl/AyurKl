import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import type { PublicPackage } from '@/lib/packages/queries'
import { whatsappLink } from '@/lib/clinic'

/** Deepawali package cross-sell strip for a treatment that has a matching package. */
export default function TreatmentPackagePromo({ pkg }: { pkg: PublicPackage }) {
  const message = `Hi, I'm interested in the ${pkg.name} (RM${pkg.priceRm}, ${pkg.sessionCount} sessions).`

  return (
    <div className="border-y border-accent/20 bg-[#F3E2CE]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-4 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
        <p className="text-center font-body text-[13.5px] text-dark/75 sm:text-left">
          🪔 <span className="font-semibold text-primary">Deepawali Promo:</span> this therapy is part of the{' '}
          <span className="font-semibold">{pkg.name}</span> — RM{pkg.priceRm} for {pkg.sessionCount} sessions.
        </p>
        <div className="flex flex-none gap-2">
          <Link
            href={`/packages/${pkg.slug}/purchase`}
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg bg-accent px-4 font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-white hover:bg-accent/90"
          >
            Buy Now
          </Link>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#25D366] px-4 font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#128C4A] hover:bg-[#25D366]/10"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
