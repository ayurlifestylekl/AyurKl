'use client'

import { useState } from 'react'
import { bulkArchive, setProductStatus } from '@/lib/admin/products/actions'

export default function BulkActionsBar({ selectedIds }: { selectedIds: string[] }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (selectedIds.length === 0) return null

  async function run(action: 'archive' | 'activate' | 'draft') {
    setPending(true)
    setMessage(null)
    let ok = 0
    if (action === 'archive') {
      const r = await bulkArchive(selectedIds)
      if (r.ok) ok = (r as { ok: true; data?: { updated: number } }).data?.updated ?? 0
    } else {
      const next = action === 'activate' ? 'active' : 'draft'
      for (const id of selectedIds) {
        // eslint-disable-next-line no-await-in-loop
        const r = await setProductStatus(id, next)
        if (r.ok) ok++
      }
    }
    setPending(false)
    setMessage(`Updated ${ok} product${ok === 1 ? '' : 's'}.`)
    setTimeout(() => location.reload(), 700)
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-[#D4A373]/30 bg-[#FAF6EE] p-3">
      <span className="text-[12px] font-semibold text-[#1e3d32]">
        {selectedIds.length} selected
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => run('activate')}
        className="rounded-lg bg-[#2F5D50] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
      >
        Set active
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run('draft')}
        className="rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32]"
      >
        Set draft
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run('archive')}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-700"
      >
        Archive
      </button>
      {message ? (
        <span className="text-[11.5px] text-[#2B2B2B]/70">{message}</span>
      ) : null}
    </div>
  )
}
