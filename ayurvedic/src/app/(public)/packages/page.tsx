import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getActivePackages } from '@/lib/packages/queries'
import { whatsappLink } from '@/lib/clinic'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Deepawali Promo Packages | Kerala Ayurvedic Lifestyle',
  description:
    'Deepawali promo — 10-session Abhyangam, Kizhi, Udwarthanam and Sirodhaara packages. Buy online, valid 1 year. Available till 30 November 2026.',
}

export default async function PackagesPage() {
  const supabase = await createClient()
  const packages = await getActivePackages(supabase)

  return (
    <section className="bg-cream pb-20">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="text-center">
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            Deepawali Promo · Available till 30 November 2026
          </div>
          <h1
            className="mt-2 font-heading font-extrabold leading-[1.05] tracking-[-0.025em] text-primary"
            style={{ fontSize: 'clamp(2rem, 5.2vw, 2.8rem)' }}
          >
            One-Time Mega Offer
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-[16px] italic leading-[1.55] text-dark/72">
            10-session therapy packages at Deepawali prices. Buy online in a few minutes, or WhatsApp us if
            you&rsquo;d like to ask first. Hurry — the offer ends 30 November.
          </p>
        </div>

        {packages.length === 0 ? (
          <p className="mt-12 text-center font-body text-[14px] text-dark/50">
            No packages are live right now — check back soon.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {packages.map((pkg) => {
              const message = `Hi, I'm interested in the ${pkg.name} (RM${pkg.priceRm}, ${pkg.sessionCount} sessions).`
              const treatmentHref = pkg.treatment
                ? `/treatments/${pkg.treatment.categorySlug}/${pkg.treatment.slug}`
                : null
              return (
                <div
                  key={pkg.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-accent/20 bg-white shadow-sm"
                >
                  {pkg.imageUrl && (
                    <div className="relative aspect-[16/10] w-full max-w-full">
                      <Image
                        src={pkg.imageUrl}
                        alt={pkg.treatment?.title ?? pkg.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-heading text-[20px] font-extrabold tracking-[-0.02em] text-primary">
                      {pkg.name}
                    </h2>
                    <div className="mt-2 font-heading text-[28px] font-extrabold text-accent">
                      RM{pkg.priceRm}
                    </div>
                    <div className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-dark/50">
                      {pkg.sessionCount} sessions · valid {Math.round(pkg.validityDays / 365)} year from purchase
                    </div>
                    {pkg.description && (
                      <p className="mt-3 font-body text-[14px] leading-[1.6] text-dark/70">{pkg.description}</p>
                    )}

                    <div className="mt-6 flex flex-1 flex-col justify-end gap-2">
                      {treatmentHref && (
                        <Link
                          href={treatmentHref}
                          className="text-center font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-accent hover:text-primary"
                        >
                          About this therapy →
                        </Link>
                      )}
                      <Link
                        href={`/packages/${pkg.slug}/purchase`}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-accent/90"
                      >
                        Buy Now
                      </Link>
                      <a
                        href={whatsappLink(message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#25D366] px-5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[#128C4A] hover:bg-[#25D366]/10"
                      >
                        <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mx-auto mt-10 max-w-xl text-center font-body text-[12px] text-dark/45">
          Valid for 1 year from the date of purchase. Packages are sharable with friends &amp; relatives — the
          package owner makes the booking. Available till 30 November 2026.
        </p>
      </div>
    </section>
  )
}
