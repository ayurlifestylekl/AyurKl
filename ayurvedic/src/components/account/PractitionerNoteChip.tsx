import { Stethoscope } from 'lucide-react'

interface PractitionerNoteChipProps {
  note: string | null
}

export default function PractitionerNoteChip({ note }: PractitionerNoteChipProps) {
  if (!note || !note.trim()) return null
  return (
    <aside className="flex items-start gap-3 rounded-2xl border border-[#D4AF37]/35 bg-[#D4AF37]/[0.08] px-4 py-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
        <Stethoscope className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#6E1023]/65">
          Note from Vaidya
        </p>
        <p className="mt-1 font-body text-[13px] leading-[1.6] text-[#1F1F1F]/80 whitespace-pre-wrap">
          {note}
        </p>
      </div>
    </aside>
  )
}
