import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import type { PublicPackage } from '@/lib/packages/queries'
import { whatsappLink } from '@/lib/clinic'

/**
 * Homepage promo for the Deepawali session packages. Renders nothing once
 * every package is set inactive (e.g. after the promo window closes) —
 * no date logic here, see /console/packages to toggle a package live.
 */
export default function DeepawaliPackagesSection({ packages }: { packages: PublicPackage[] }) {
  if (packages.length === 0) return null

  return (
    <section aria-label="Deepawali promo packages" className="bg-[#F3E2CE]">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="text-center">
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            Deepawali Promo · Available till 30 November 2026
          </div>
          <h2
            className="mt-2 font-heading font-extrabold leading-[1.05] tracking-[-0.025em] text-primary"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.4rem)' }}
          >
            One-Time Mega Offer
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-[15px] italic text-dark/70">
            10-session packages on our most-loved therapies, valid for 1 year. Hurry before it expires.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => {
            const message = `Hi, I'm interested in the ${pkg.name} (RM${pkg.priceRm}, ${pkg.sessionCount} sessions).`
            return (
              <div key={pkg.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
                {pkg.imageUrl && (
                  <div className="relative aspect-[4/3] w-full max-w-full">
                    <Image
                      src={pkg.imageUrl}
                      alt={pkg.treatment?.title ?? pkg.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-[16px] font-extrabold leading-tight text-primary">{pkg.name}</h3>
                  <div className="mt-1.5 font-heading text-[22px] font-extrabold text-accent">RM{pkg.priceRm}</div>
                  <div className="font-heading text-[9.5px] font-bold uppercase tracking-[0.16em] text-dark/50">
                    {pkg.sessionCount} sessions
                  </div>
                  {pkg.description && (
                    <p className="mt-2 font-body text-[12.5px] leading-[1.5] text-dark/65">{pkg.description}</p>
                  )}
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/packages/${pkg.slug}/purchase`}
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-white hover:bg-accent/90"
                    >
                      Buy Now
                    </Link>
                    <a
                      href={whatsappLink(message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#25D366] px-4 font-heading text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#128C4A] hover:bg-[#25D366]/10"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/packages"
            className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-primary underline-offset-4 hover:underline"
          >
            See full package details →
          </Link>
        </div>
      </div>
    </section>
  )
}
