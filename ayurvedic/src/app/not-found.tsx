import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, CalendarHeart, Leaf, MessageCircle, Phone, Sparkles, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import { LotusMark } from '@/components/ui/Ornament'
import { CLINIC_PHONE_PRIMARY, CLINIC_ADDRESS, telLink, whatsappLink } from '@/lib/clinic'

// Root 404 renders inside the root layout only (not the (public) layout), so it
// brings its own navbar/footer — a lost visitor should never be stranded.
const PATHS = [
  { href: '/treatments', icon: Leaf, title: 'Our therapies', text: 'Over 60 authentic Kerala Ayurveda therapies.' },
  { href: '/book/consultation', icon: CalendarHeart, title: 'Free consultation', text: 'A 30-minute assessment with our Vaidyas.' },
  { href: '/about', icon: Users, title: 'About us', text: 'Serving Brickfields, Kuala Lumpur since 2008.' },
  { href: '/contact', icon: MessageCircle, title: 'Contact', text: 'Message, call or visit the centre.' },
]

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main>
        <section
          aria-labelledby="not-found-heading"
          className="relative overflow-hidden bg-[#F7F2E8]"
        >
          <div className="pointer-events-none absolute -left-24 -top-24 hidden h-[420px] w-[420px] md:block">
            <BotanicalMandala opacity={0.18} />
          </div>
          <div className="pointer-events-none absolute -bottom-32 -right-24 hidden h-[460px] w-[460px] md:block">
            <BotanicalMandala opacity={0.16} />
          </div>
          <FloatingLeaf
            className="pointer-events-none absolute hidden md:block"
            style={{ left: '9%', top: '22%', width: 38, height: 50, transform: 'rotate(-22deg)' }}
            opacity={0.2}
          />
          <FloatingLeaf
            className="pointer-events-none absolute hidden md:block"
            style={{ right: '11%', top: '58%', width: 42, height: 56, transform: 'rotate(18deg)' }}
            opacity={0.18}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 640,
              height: 640,
              maxWidth: '100vw',
              background:
                'radial-gradient(circle at center, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 30%, transparent 65%)',
              filter: 'blur(28px)',
            }}
          />

          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-16 text-center sm:px-8 md:pb-24 md:pt-20 lg:px-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/60 px-4 py-1.5 backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" strokeWidth={2.4} />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Page not found
              </span>
            </span>

            {/* "4 ❀ 4" — the lotus stands in for the zero */}
            <div
              aria-hidden
              className="mt-6 flex items-center justify-center font-display italic leading-none text-primary"
              style={{ fontSize: 'clamp(88px, 17vw, 168px)' }}
            >
              <span>4</span>
              <span
                className="mx-[0.06em] inline-flex items-center justify-center rounded-full border border-accent/50 bg-white/70 shadow-[0_18px_40px_-22px_rgba(110,16,35,0.55)]"
                style={{ width: '0.78em', height: '0.78em', transform: 'translateY(0.14em)' }}
              >
                <LotusMark className="h-[58%] w-[58%]" strokeWidth={1.1} />
              </span>
              <span>4</span>
            </div>

            <h1
              id="not-found-heading"
              className="mt-12 text-balance font-heading text-[28px] font-extrabold leading-[1.1] text-primary sm:text-[36px]"
            >
              This path has wandered off.
            </h1>
            <p className="mt-4 max-w-xl font-body text-[16px] leading-relaxed text-dark/70 md:text-[17px]">
              The page you&rsquo;re looking for has moved or no longer exists. Let us guide you back — every path
              below leads somewhere restorative.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/"
                className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_18px_40px_-18px_rgba(74,12,24,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4A0C18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Home
              </Link>
              <Link
                href="/book/consultation"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-primary/30 bg-white/50 px-7 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-primary backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Book a Consultation
              </Link>
            </div>

            <div className="mt-14 w-full">
              <div className="mb-4 flex items-center gap-3 font-heading text-[10.5px] font-bold uppercase tracking-[0.28em] text-accent">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" aria-hidden />
                Popular paths
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" aria-hidden />
              </div>
              <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
                {PATHS.map(({ href, icon: Icon, title, text }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex min-w-0 flex-col rounded-2xl border border-accent/25 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E2CE] text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    <span className="mt-4 font-heading text-[15px] font-extrabold text-primary">{title}</span>
                    <span className="mt-1 font-body text-[13px] leading-relaxed text-dark/65">{text}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-2 font-body text-[13.5px] text-dark/65 sm:flex-row sm:gap-5">
              <a href={whatsappLink('Hi, I was looking for a page on your website.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
                <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp {CLINIC_PHONE_PRIMARY}
              </a>
              <span className="hidden h-1 w-1 rounded-full bg-accent/70 sm:block" aria-hidden />
              <a href={telLink()} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Phone className="h-4 w-4 text-accent" /> Call us
              </a>
              <span className="hidden h-1 w-1 rounded-full bg-accent/70 sm:block" aria-hidden />
              <span>{CLINIC_ADDRESS}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
