import { Sparkles } from 'lucide-react'
import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import { getTimeGreeting, getTipOfDay } from '@/lib/dashboard/wellness-tips'

interface DashboardHeroProps {
  firstName: string
}

export default function DashboardHero({ firstName }: DashboardHeroProps) {
  const greeting = getTimeGreeting()
  const tip = getTipOfDay()

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-[#163F33]/8 bg-[#163F33] px-6 py-5 text-white sm:px-8 sm:py-5"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(22, 63, 51,0.04), 0 20px 40px -20px rgba(22, 63, 51,0.25)',
      }}
    >
      {/* Decoration layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(65% 60% at 80% 10%, rgba(212, 175, 55,0.16), transparent 65%), radial-gradient(55% 60% at 0% 100%, rgba(46, 125, 90,0.14), transparent 65%)',
        }}
      />
      <BotanicalMandala
        className="pointer-events-none absolute -right-20 -top-12 hidden h-[260px] w-[260px] sm:block"
        opacity={0.07}
        stroke="#D4AF37"
      />
      <FloatingLeaf
        className="pointer-events-none absolute right-8 bottom-4 hidden h-12 w-10 rotate-[12deg] lg:block"
        color="#2E7D5A"
        strokeColor="#D4AF37"
        opacity={0.18}
      />

      <div className="relative z-10">
        {/* Eyebrow */}
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-0.5">
          <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" />
          <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
            Member Portal
          </span>
        </div>

        {/* Greeting */}
        <h1
          className="font-heading text-[22px] font-bold leading-tight text-white sm:text-[26px] lg:text-[30px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          {greeting},{' '}
          <span className="text-[#D4AF37]">{firstName}.</span>
        </h1>

        {/* Wellness tip */}
        <div className="mt-2 max-w-2xl">
          <p
            className="font-display italic text-white/75 sm:text-[14px]"
            style={{ fontSize: 13, lineHeight: 1.5 }}
          >
            &ldquo;{tip.quote}&rdquo;
          </p>
          {tip.attribution && (
            <p className="mt-0.5 font-body text-[10px] uppercase tracking-[0.18em] text-white/40">
              — {tip.attribution}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
