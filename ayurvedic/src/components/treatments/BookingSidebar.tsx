import Link from 'next/link'

interface BookingSidebarProps {
  treatmentTitle: string
  duration: string | null
  sessionsRecommended: string | null
  whatsappHref: string
}

export default function BookingSidebar({
  treatmentTitle,
  duration,
  sessionsRecommended,
  whatsappHref,
}: BookingSidebarProps) {
  return (
    <div className="sticky top-24 hidden lg:block">
      <div className="relative rounded-xl border border-accent/40 bg-white p-5 shadow-elevated">
        <span className="absolute -top-2 right-3 rounded bg-accent px-2 py-0.5 font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-white">
          Booking
        </span>

        <div className="mb-3 font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
          {treatmentTitle}
        </div>

        <dl className="divide-y divide-accent/20">
          <Row label="Duration" value={duration ?? 'See practitioner'} />
          <Row label="Sessions" value={sessionsRecommended ?? 'Per consultation'} />
          <Row label="Price" value="On consultation" valueClass="text-accent" />
        </dl>

        <Link
          href="/book/consultation"
          className="mt-4 block rounded bg-accent px-4 py-3 text-center font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Book Treatment
        </Link>
        <Link
          href={whatsappHref}
          className="mt-2 block rounded border border-primary/40 px-4 py-3 text-center font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          WhatsApp Us
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2 font-heading text-[11px]">
      <dt className="tracking-[0.1em] text-dark/55">{label.toUpperCase()}</dt>
      <dd className={`font-bold text-dark ${valueClass}`}>{value}</dd>
    </div>
  )
}
