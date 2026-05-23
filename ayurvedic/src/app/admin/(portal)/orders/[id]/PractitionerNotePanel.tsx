'use client'

import { useState } from 'react'
import { addPractitionerNote } from '@/lib/admin/orders/actions'

export default function PractitionerNotePanel({
  orderId,
  initial,
}: {
  orderId: string
  initial: string | null
}) {
  const [val, setVal] = useState(initial ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function save() {
    setPending(true)
    setError(null)
    setSaved(false)
    const r = await addPractitionerNote(orderId, val.trim())
    setPending(false)
    if (!r.ok) setError(r.error)
    else setSaved(true)
  }

  return (
    <div className="rounded-2xl border border-[#D4A373]/30 bg-[#FAF6EE]/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">
          Practitioner note
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4A373]">
          Visible to customer
        </span>
      </div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={3}
        placeholder="A short note from the Vaidya for the customer…"
        className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 bg-white px-3 py-2 text-[13px]"
      />
      {error ? <p className="mt-2 text-[12px] text-red-600">{error}</p> : null}
      {saved ? (
        <p className="mt-2 text-[12px] text-emerald-700">Saved.</p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="mt-2 rounded-lg bg-[#D4A373] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#b58a5d] disabled:opacity-50"
      >
        Save note
      </button>
    </div>
  )
}
