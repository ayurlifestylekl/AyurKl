import type { PromoStats } from '@/lib/packages/promo-stats'
import { fmtMY } from '@/lib/datetime'

/** Deepawali click and sales numbers at the top of /console/packages. */
export default function PromoClicksPanel({ stats }: { stats: PromoStats }) {
  const busiestDay = Math.max(1, ...stats.daily.map((d) => d.clicks))
  const busiestPlacement = Math.max(1, ...stats.byPlacement.map((p) => p.clicks))

  return (
    <section aria-label="Promo clicks" className="mb-6 rounded-xl border border-accent/30 bg-white p-5">
      <h3 className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Promo clicks</h3>
      <p className="mt-1 font-body text-[12.5px] text-dark/55">
        Deepawali promo only. A click is one press of a promo button, so one person clicking twice counts as two.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="Total clicks" value={stats.totalClicks} />
        <Tile label="Clicks today" value={stats.todayClicks} />
        <Tile label="Flyer shown" value={stats.flyerViews} />
        <Tile label="Page visits" value={stats.pageViews} />
        <Tile label="Sold online" value={stats.onlineSales} />
        <Tile label="Sold at centre" value={stats.counterSales} />
      </dl>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
        <div className="min-w-0">
          <Heading>By package</Heading>
          <div className="overflow-x-auto">
            <table className="w-full font-body text-[13px]">
              <thead>
                <tr className="text-left font-heading text-[10px] uppercase tracking-[0.1em] text-dark/50">
                  <th className="py-1 pr-3 font-semibold">Package</th>
                  <th className="px-2 py-1 text-right font-semibold">Buy Now</th>
                  <th className="px-2 py-1 text-right font-semibold">WhatsApp</th>
                  <th className="py-1 pl-2 text-right font-semibold">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/10">
                {stats.byPackage.map((p) => (
                  <tr key={p.slug}>
                    <td className="py-1.5 pr-3 text-dark/80">{p.name}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{p.buy}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{p.whatsapp}</td>
                    <td className="py-1.5 pl-2 text-right font-semibold tabular-nums text-primary">{p.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0">
          <Heading>By location</Heading>
          <ul className="space-y-1.5">
            {stats.byPlacement.map((p) => (
              <Bar key={p.placement} label={p.label} value={p.clicks} max={busiestPlacement} />
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <Heading>By day</Heading>
          {stats.daily.length === 0 ? (
            <p className="font-body text-[12.5px] text-dark/50">No clicks yet.</p>
          ) : (
            <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {stats.daily.map((d) => (
                <Bar
                  key={d.day}
                  label={fmtMY(`${d.day}T12:00:00+08:00`, { day: 'numeric', month: 'short' })}
                  value={d.clicks}
                  max={busiestDay}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-cream/70 px-3 py-2.5">
      <dt className="font-heading text-[9.5px] font-bold uppercase tracking-[0.12em] text-dark/50">{label}</dt>
      <dd className="mt-0.5 font-heading text-[22px] font-extrabold tabular-nums text-primary">{value.toLocaleString('en-MY')}</dd>
    </div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">{children}</h4>
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <li>
      <div className="flex justify-between gap-3 font-body text-[12.5px]">
        <span className="text-dark/75">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-0.5 h-1.5 rounded-full bg-cream">
        <div className="h-full rounded-full bg-accent" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </li>
  )
}
