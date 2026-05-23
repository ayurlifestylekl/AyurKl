import { barChartPath } from '@/lib/admin/charts'

interface Props {
  data: Array<{ date: string; count: number }>
}

const DAY_FMT = new Intl.DateTimeFormat('en-MY', { weekday: 'short' })

export default function OrdersBarChart({ data }: Props) {
  const w = 300
  const h = 90
  const { bars, max } = barChartPath(
    data.map((d) => d.count),
    w,
    h
  )
  const isEmpty = max === 1 && data.every((d) => d.count === 0)
  return (
    <article
      className="overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white p-5"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <header className="flex items-baseline justify-between">
        <h3 className="font-heading text-[13px] font-semibold text-[#1e3d32]">
          Orders · last 7 days
        </h3>
        <span className="font-body text-[11px] text-[#2B2B2B]/55">Peak {max}</span>
      </header>
      <svg
        viewBox={`0 0 ${w} ${h + 20}`}
        className="mt-3 h-24 w-full"
        preserveAspectRatio="none"
        aria-label="Orders over the last 7 days"
      >
        {bars.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2} fill="#2F5D50" opacity={0.85} />
            <text
              x={b.x + b.w / 2}
              y={h + 14}
              textAnchor="middle"
              className="fill-[#1e3d32]/55"
              style={{ font: '9px ui-sans-serif' }}
            >
              {DAY_FMT.format(new Date(data[i].date))[0]}
            </text>
          </g>
        ))}
      </svg>
      {isEmpty && (
        <p className="mt-2 text-center font-body text-[11px] italic text-[#2B2B2B]/45">
          Collecting data…
        </p>
      )}
    </article>
  )
}
