interface Props {
  stages: Array<{ stage: string; count: number }>
}

export default function FulfilmentFunnel({ stages }: Props) {
  const max = Math.max(1, ...stages.map((s) => s.count))
  const isEmpty = max === 1 && stages.every((s) => s.count === 0)
  return (
    <article
      className="overflow-hidden rounded-3xl border border-[#6E1023]/8 bg-white p-5"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(110,16,35,0.04), 0 12px 30px -16px rgba(110,16,35,0.18)',
      }}
    >
      <header className="flex items-baseline justify-between">
        <h3 className="font-heading text-[13px] font-semibold text-[#6E1023]">
          Fulfilment funnel · 30 days
        </h3>
      </header>
      <ul className="mt-3 space-y-2">
        {stages.map((s) => (
          <li key={s.stage}>
            <div className="flex items-baseline justify-between text-[11.5px]">
              <span className="font-heading font-semibold text-[#6E1023]">{s.stage}</span>
              <span className="font-body tabular-nums text-[#1F1F1F]/65">{s.count}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#6E1023]/[0.06]">
              <div
                className="h-full rounded-full bg-[#6E1023]"
                style={{ width: `${(s.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {isEmpty && (
        <p className="mt-3 text-center font-body text-[11px] italic text-[#1F1F1F]/45">
          Collecting data…
        </p>
      )}
    </article>
  )
}
