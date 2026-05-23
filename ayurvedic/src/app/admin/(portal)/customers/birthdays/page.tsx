import Link from 'next/link'
import { Cake } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listBirthdaysThisMonth } from '@/lib/admin/customers/queries'

export const metadata = { title: 'Birthdays · Admin' }
export const dynamic = 'force-dynamic'

export default async function BirthdaysPage() {
  const supabase = await createClient()
  const { thisWeek, thisMonth } = await listBirthdaysThisMonth(supabase)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Link
        href="/admin/customers"
        className="text-[11px] uppercase tracking-wider text-[#1e3d32]/55 hover:text-[#D4A373]"
      >
        ← Back to customers
      </Link>
      <header>
        <div className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-[#D4A373]" />
          <h1 className="font-heading text-[24px] font-bold text-[#1e3d32]">Birthdays</h1>
        </div>
        <p className="mt-1 text-[12.5px] text-[#2B2B2B]/65">
          Customers with a birthday this month — send them a voucher to celebrate.
        </p>
      </header>

      <BirthdaySection title="This week" customers={thisWeek} />
      <BirthdaySection title="This month" customers={thisMonth} />
    </div>
  )
}

function BirthdaySection({
  title,
  customers,
}: {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customers: any[]
}) {
  return (
    <section className="rounded-2xl border border-[#1e3d32]/8 bg-white">
      <header className="flex items-center justify-between border-b border-[#1e3d32]/6 px-5 py-3">
        <h2 className="font-heading text-[14px] font-semibold text-[#1e3d32]">
          {title} ({customers.length})
        </h2>
      </header>
      {customers.length === 0 ? (
        <p className="px-5 py-6 text-center text-[12.5px] italic text-[#2B2B2B]/55">
          No birthdays {title.toLowerCase()}.
        </p>
      ) : (
        <ul className="divide-y divide-[#1e3d32]/6">
          {customers.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between px-5 py-3 text-[13px]"
            >
              <div>
                <Link
                  href={`/admin/customers/${c.id}`}
                  className="font-semibold text-[#1e3d32] hover:text-[#D4A373]"
                >
                  {c.full_name ?? 'Unnamed'}
                </Link>
                <p className="text-[11.5px] text-[#2B2B2B]/55">{c.email}</p>
              </div>
              <span className="text-[12px] text-[#2B2B2B]/65">
                {c.date_of_birth
                  ? new Date(c.date_of_birth).toLocaleDateString('en-MY', {
                      day: 'numeric',
                      month: 'long',
                    })
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
