import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { Construction, TrendingUp, ShoppingBag, Sparkles, type LucideIcon } from 'lucide-react'

export const metadata = {
  title: 'Partner Overview',
}

export default async function AgentDashboardPage() {
  const me = await getCurrentUser()
  const firstName = me?.profile.full_name?.split(' ')[0] ?? 'Partner'

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4A373]">
          Partner Hub
        </span>
        <h1
          className="mt-2 font-heading text-3xl font-bold leading-tight text-[#1e3d32] sm:text-4xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          Welcome to the program, {firstName}.
        </h1>
        <p
          className="mt-3 max-w-2xl font-body text-[14px] text-[#2B2B2B]/70"
          style={{ lineHeight: 1.7 }}
        >
          Track referred sales, see your commission, and grab your sharing link. Real partner pages ship next — for now your invite is locked in and our team can run reports manually.
        </p>
      </header>

      <section
        className="relative overflow-hidden rounded-3xl border border-[#D4A373]/30 bg-white p-7"
        style={{ boxShadow: '0 12px 30px -16px rgba(30,61,50,0.16)' }}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4A373]/15">
            <Construction className="h-5 w-5 text-[#D4A373]" strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <h2 className="font-heading text-lg font-semibold text-[#1e3d32]">
              The Partner Hub is being built.
            </h2>
            <p className="mt-1.5 font-body text-[13.5px] text-[#2B2B2B]/65" style={{ lineHeight: 1.7 }}>
              You&apos;re officially in. Your referral link and commission tracking go live in the Partner sub-project. For now, share your code with your TikTok audience — every sale through it is being attributed in the background, and we&apos;ll surface the numbers here as soon as the dashboard ships.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 sm:grid-cols-3">
        <PlaceholderTile icon={ShoppingBag} title="Referred Sales" body="Every sale through your link." />
        <PlaceholderTile icon={TrendingUp} title="Earnings" body="Commission month-by-month." />
        <PlaceholderTile icon={Sparkles} title="Your Link & QR" body="Share-ready assets coming soon." />
      </section>
    </div>
  )
}

function PlaceholderTile({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <article className="rounded-3xl border border-[#1e3d32]/8 bg-white p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e3d32]/[0.06]">
        <Icon className="h-4 w-4 text-[#2F5D50]" strokeWidth={1.8} />
      </span>
      <h3 className="mt-4 font-heading text-base font-semibold text-[#1e3d32]">{title}</h3>
      <p className="mt-1.5 font-body text-[12.5px] text-[#2B2B2B]/55">{body}</p>
    </article>
  )
}
