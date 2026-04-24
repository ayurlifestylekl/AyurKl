import Link from 'next/link'
import { ArrowUpRight, Calendar, Leaf, MessageCircle } from 'lucide-react'

import BookingPolicyStrip from './BookingPolicyStrip'

/**
 * Landing page at /book. Two routes branch from here:
 *   - Free 30-min consultation with Vaidya Akhil (default / most visitors)
 *   - Book a specific treatment (for returning / informed customers)
 *
 * Deliberately a chooser — the navbar "Book Now" button and every
 * ambiguous CTA lands here, so the user should be able to pick their lane
 * without reading a wall of text.
 */
export default function BookingChooser() {
  return (
    <>
      <BookingPolicyStrip />

      <section
        aria-labelledby="booking-chooser-heading"
        className="relative overflow-hidden bg-cream"
      >
        {/* Layered warm atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 10% 0%, rgba(212,163,115,0.16) 0%, transparent 40%), radial-gradient(ellipse at 90% 100%, rgba(47,93,80,0.05) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(212,163,115,0.04) 0%, transparent 40%)',
          }}
        />
        {/* Diamond dot pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(47,93,80,0.025) 1px, transparent 1px),
              radial-gradient(circle, rgba(47,93,80,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-[2px] w-10 rounded-full bg-accent"
            />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Begin Your Journey
            </span>
            <span
              aria-hidden
              className="h-[2px] w-10 rounded-full bg-accent"
            />
          </div>

          {/* Heading */}
          <h1
            id="booking-chooser-heading"
            className="mt-6 max-w-3xl text-center font-heading font-extrabold leading-[1.05] text-primary"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              letterSpacing: '-0.03em',
            }}
          >
            Two ways to meet your{' '}
            <span className="font-body font-normal italic text-accent">
              Vaidya.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-center font-body text-[15px] leading-[1.75] text-dark/65 sm:text-[16px]">
            Whether you&apos;re new to Ayurveda or coming in for a specific
            therapy, we have a dedicated flow for you. Both lead to Vaidya
            AKHIL HS (B.A.M.S) at our Brickfields clinic.
          </p>

          {/* Two cards */}
          <div className="mt-14 grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:mt-16 lg:gap-10">
            {/* ── CARD 1 — Free Consultation ── */}
            <Link
              href="/book/consultation"
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-primary p-8 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-cream sm:p-10"
              style={{
                boxShadow:
                  '0 10px 30px -12px rgba(47,93,80,0.35), 0 30px 60px -28px rgba(47,93,80,0.35)',
              }}
            >
              {/* Warm atmosphere */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse at 100% 0%, rgba(212,163,115,0.24) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(26,46,38,0.5) 0%, transparent 55%)',
                }}
              />
              {/* Gold corner accents */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-accent/50"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-accent/50"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-accent/50"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-accent/50"
              />

              <div className="relative flex flex-1 flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5">
                    <Leaf
                      className="h-3 w-3 text-accent"
                      strokeWidth={2.2}
                    />
                    <span className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-accent">
                      Free · 30 min
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 text-accent/70 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                    strokeWidth={2}
                  />
                </div>

                <h2 className="font-heading text-2xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-3xl">
                  Free Consultation.
                </h2>

                <div
                  aria-hidden
                  className="h-px w-12 transition-all duration-500 group-hover:w-24"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(212,163,115,0.85), rgba(212,163,115,0.15))',
                  }}
                />

                <p className="font-body text-[14px] leading-[1.7] text-white/65">
                  Sit down with Vaidya Akhil, get your dosha assessed, and
                  leave with a protocol tailored to what your body actually
                  needs. No commitment required.
                </p>

                <ul className="mt-2 flex flex-col gap-2.5 font-body text-[13px] text-white/75">
                  {[
                    'Dosha assessment (Vata, Pitta, Kapha)',
                    'Personal treatment protocol',
                    'Lifestyle & diet guidance',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-dark">
                    <Calendar className="h-4 w-4" strokeWidth={2.2} />
                    Book Consultation
                  </span>
                </div>
              </div>
            </Link>

            {/* ── CARD 2 — Treatment Booking ── */}
            <Link
              href="/book/treatment"
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 ring-1 ring-primary/10 transition-[transform,box-shadow,ring-color] duration-500 ease-out hover:-translate-y-1.5 hover:ring-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-cream sm:p-10"
              style={{
                boxShadow:
                  '0 2px 6px rgba(47,93,80,0.04), 0 30px 60px -28px rgba(47,93,80,0.22)',
              }}
            >
              {/* Gold accent bar */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(to right, rgba(212,163,115,0.4), rgba(212,163,115,0.9) 50%, rgba(212,163,115,0.4))',
                }}
              />
              {/* Warm atmosphere */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 100% 0%, rgba(212,163,115,0.09) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(47,93,80,0.04) 0%, transparent 55%)',
                }}
              />

              <div className="relative flex flex-1 flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1.5">
                    <Calendar
                      className="h-3 w-3 text-primary"
                      strokeWidth={2.2}
                    />
                    <span className="font-heading text-[9px] font-bold uppercase tracking-[0.18em] text-primary/80">
                      60+ min · Pay at clinic
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 text-primary/40 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                    strokeWidth={2}
                  />
                </div>

                <h2 className="font-heading text-2xl font-extrabold leading-[1.1] tracking-[-0.02em] text-primary sm:text-3xl">
                  Book a Treatment.
                </h2>

                <div
                  aria-hidden
                  className="h-px w-12 transition-all duration-500 group-hover:w-24"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(212,163,115,0.85), rgba(212,163,115,0.15))',
                  }}
                />

                <p className="font-body text-[14px] leading-[1.7] text-dark/70">
                  Know which therapy you want? Pick from our library of 60+
                  authentic Kerala Ayurveda protocols and we&apos;ll get you
                  on the calendar with Vaidya Akhil.
                </p>

                <ul className="mt-2 flex flex-col gap-2.5 font-body text-[13px] text-dark/70">
                  {[
                    'Abhyanga, Shirodhara, Panchakarma & more',
                    'Searchable menu by category',
                    'Direct slot booking',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-300 group-hover:bg-[#264d42]">
                    <Calendar className="h-4 w-4" strokeWidth={2.2} />
                    Pick a Treatment
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* WhatsApp fallback */}
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden
              className="h-px w-10"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(212,163,115,0.55), transparent)',
              }}
            />
            <p className="font-body text-[13px] italic text-dark/55">
              Prefer to talk it through first?
            </p>
            <Link
              href="https://wa.me/601165043436?text=Hi%2C%20I%27d%20like%20to%20book%20an%20Ayurveda%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-primary/25 pb-0.5 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              Message us on WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
