import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { Construction, ShoppingBag, ClipboardList, Sparkles, type LucideIcon } from 'lucide-react'

export const metadata = {
  title: 'Admin Overview',
}

export default async function AdminDashboardPage() {
  const me = await getCurrentUser()
  const firstName = me?.profile.full_name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4A373]">
          Command Center
        </span>
        <h1
          className="mt-2 font-heading text-3xl font-bold leading-tight text-[#1e3d32] sm:text-4xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          Welcome, {firstName}.
        </h1>
        <p
          className="mt-3 max-w-2xl font-body text-[14px] text-[#2B2B2B]/70"
          style={{ lineHeight: 1.7 }}
        >
          Manage products, orders, consultations, and Brand Partners. Real management pages ship in the next phase — meanwhile the foundation is solid.
        </p>
      </header>

      <section
        className="relative overflow-hidden rounded-3xl border border-[#1e3d32]/12 bg-[#152b22] p-7 text-white"
        style={{ boxShadow: '0 16px 40px -18px rgba(30,61,50,0.45)' }}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4A373]/15">
            <Construction className="h-5 w-5 text-[#D4A373]" strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <h2 className="font-heading text-lg font-semibold">
              The Command Center is under construction.
            </h2>
            <p
              className="mt-1.5 font-body text-[13.5px] text-white/65"
              style={{ lineHeight: 1.7 }}
            >
              Authentication, role gating, and the dashboard shell are live. CRUD interfaces for products, orders, consultations, and Brand Partner management arrive in the Admin sub-project. Until then, use the Supabase dashboard directly — see <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[12px]">docs/admin-bootstrap.md</code> for invite SQL.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 sm:grid-cols-3">
        <PlaceholderTile icon={ShoppingBag} title="Products" body="Inventory + bundle management." />
        <PlaceholderTile icon={ClipboardList} title="Orders" body="Fulfillment + tracking." />
        <PlaceholderTile icon={Sparkles} title="Brand Partners" body="Invites + commission setup." />
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
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <h3 className="mt-4 font-heading text-base font-semibold text-[#1e3d32]">{title}</h3>
      <p className="mt-1.5 font-body text-[12.5px] text-[#2B2B2B]/55">{body}</p>
    </article>
  )
}
